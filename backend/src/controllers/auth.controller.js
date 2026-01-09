const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const oauthConfig = require('../config/oauth.config');

class AuthController {
  async redirectTo42(req, res) {
    try {
      const state = Math.random().toString(36).substring(7); //CSRF
      
      const params = new URLSearchParams({
        client_id: oauthConfig.clientId,
        redirect_uri: oauthConfig.redirectUri,
        response_type: 'code',
        scope: 'public',
        state: state
      });

      const authUrl = `${oauthConfig.authorizationURL}?${params.toString()}`;
      
      console.log('Redirecting to 42 OAuth...');
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error in redirectTo42:', error.message);
      res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  }

  async handleCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.log('User denied access:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=access_denied`);
      }

      if (!code) {
        console.log('No authorization code provided');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
      }

      console.log('Authorization code received');

      console.log('Exchanging code for access token...');
      const tokenResponse = await axios.post(oauthConfig.tokenURL, {
        grant_type: 'authorization_code',
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        code: code,
        redirect_uri: oauthConfig.redirectUri
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      console.log('Access token received');

      console.log('Fetching user profile from 42 API...');
      const userResponse = await axios.get(`${oauthConfig.apiURL}/me`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      const profile = userResponse.data;
      console.log('User profile received:', profile.login);
      console.log('Projects count:', profile.projects_users?.length || 0);
      console.log('Cursus count:', profile.cursus_users?.length || 0);

      let user = await User.findOne({ intraId: profile.id });

      const userData = {
        intraId: profile.id,
        login: profile.login,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: profile.displayname,
        avatar: {
          small: profile.image?.versions?.small,
          medium: profile.image?.versions?.medium,
          large: profile.image?.versions?.large
        },
        campus: profile.campus?.[0]?.name,
        cursus: profile.cursus_users?.map(c => c.cursus.name) || [],
        wallet: profile.wallet,
        correctionPoints: profile.correction_point,
        
        level: profile.cursus_users?.find(c => c.cursus.slug === '42cursus')?.level || 
               profile.cursus_users?.[profile.cursus_users.length - 1]?.level || 0,
        cursusUsers: profile.cursus_users || [],
        projectsUsers: profile.projects_users || [],
        achievements: profile.achievements || [],
        coalition: profile.coalitions?.[0],
        
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        lastSyncedAt: new Date()
      };

      if (!user) {
        console.log('Creating new user with full data...');
        user = await User.create(userData);
        console.log('New user created with', user.projectsUsers?.length || 0, 'projects');
      } else {
        console.log('Updating existing user with full data...');
        Object.assign(user, userData);
        user.lastLogin = new Date();
        await user.save();
        console.log('User updated with', user.projectsUsers?.length || 0, 'projects');
      }

      const jwtToken = jwt.sign(
        { 
          userId: user._id,
          login: user.login,
          intraId: user.intraId
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('JWT created, redirecting to frontend...');

      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwtToken}`);

    } catch (error) {
      console.error('Auth callback error:', error.response?.data || error.message);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  async getCurrentUser(req, res) {
    try {
      let user = await User.findById(req.userId).select('-accessToken -refreshToken');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      //cheking if data is stale (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (user.lastSyncedAt < oneHourAgo && user.accessToken) {
        console.log('Data is stale, fetching fresh data from 42 API...');
        
        try {
          const fullUser = await User.findById(req.userId);
          const response = await axios.get(`${oauthConfig.apiURL}/me`, {
            headers: { 'Authorization': `Bearer ${fullUser.accessToken}` }
          });
          
          const profile = response.data;
          
          user.level = profile.cursus_users?.find(c => c.cursus.slug === '42cursus')?.level || 
                       profile.cursus_users?.[profile.cursus_users.length - 1]?.level || 0;
          user.cursusUsers = profile.cursus_users || [];
          user.projectsUsers = profile.projects_users || [];
          user.achievements = profile.achievements || [];
          user.wallet = profile.wallet;
          user.correctionPoints = profile.correction_point;
          user.lastSyncedAt = new Date();
          
          await user.save();
          
          console.log('Fresh data fetched and saved');
        } catch (syncError) {
          console.error('Failed to sync data:', syncError.message);
        }
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error.message);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async refreshUserData(req, res) {
    try {
      console.log('Manual refresh requested by user:', req.userId);
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.accessToken) {
        return res.status(400).json({ error: 'No access token available' });
      }

      console.log('Fetching fresh data from 42 API...');
      const response = await axios.get(`${oauthConfig.apiURL}/me`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      
      const profile = response.data;
      
      user.level = profile.cursus_users?.find(c => c.cursus.slug === '42cursus')?.level || 
                   profile.cursus_users?.[profile.cursus_users.length - 1]?.level || 0;
      user.cursusUsers = profile.cursus_users || [];
      user.projectsUsers = profile.projects_users || [];
      user.achievements = profile.achievements || [];
      user.wallet = profile.wallet;
      user.correctionPoints = profile.correction_point;
      user.campus = profile.campus?.[0]?.name;
      user.avatar = {
        small: profile.image?.versions?.small,
        medium: profile.image?.versions?.medium,
        large: profile.image?.versions?.large
      };
      user.lastSyncedAt = new Date();
      
      await user.save();
      
      console.log('User data refreshed successfully');
      console.log('New level:', user.level);
      console.log('Projects count:', user.projectsUsers?.length || 0);
      
      const userResponse = user.toJSON();
      res.json({ 
        message: 'Data refreshed successfully',
        user: userResponse 
      });
      
    } catch (error) {
      console.error('Refresh user data error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to refresh user data',
        details: error.message 
      });
    }
  }

  async logout(req, res) {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }

  async healthCheck(req, res) {
    res.json({ 
      status: 'ok',
      message: 'Auth system is running',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new AuthController();
