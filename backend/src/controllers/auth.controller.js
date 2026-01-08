const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const oauthConfig = require('../config/oauth.config');

class AuthController {
  //redirect user to 42 OAuth login page
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

      //user denied access
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

      //create or update user in database
      let user = await User.findOne({ intraId: profile.id });

      if (!user) {
        console.log('Creating new user...');
        user = await User.create({
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
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000)
        });
        console.log('New user created');
      } else {
        console.log('Updating existing user...');
        user.accessToken = access_token;
        user.refreshToken = refresh_token;
        user.tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
        user.lastLogin = new Date();
        user.avatar = {
          small: profile.image?.versions?.small,
          medium: profile.image?.versions?.medium,
          large: profile.image?.versions?.large
        };
        await user.save();
        console.log('User updated');
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
      const user = await User.findById(req.userId).select('-accessToken -refreshToken');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error.message);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async logout(req, res) {
    try {
      //in a real app we might want to blacklist the JWT or revoke the 42 token
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