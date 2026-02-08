const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const oauthConfig = require('../config/oauth.config');

async function fetchUserQuests(accessToken, intraId) {
  try {
    const response = await axios.get(`${oauthConfig.apiURL}/users/${intraId}/quests_users`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: { per_page: 100 }
    });
    return response.data || [];
  } catch (error) {
    return [];
  }
}

function calculateCurrentCircle(questsUsers) {
  if (!questsUsers || questsUsers.length === 0) return 0;
  let highestCompletedCircle = -1;
  for (const qu of questsUsers) {
    if (!qu.validated_at || !qu.quest) continue;
    const slug = qu.quest.slug || '';
    const match = slug.match(/common-core-rank-(\d+)/);
    if (match) {
      const circleNum = parseInt(match[1], 10);
      if (circleNum > highestCompletedCircle) {
        highestCompletedCircle = circleNum;
      }
    }
  }
  return highestCompletedCircle + 1;
}

function detectCurriculum(projectsUsers) {
  if (!projectsUsers || projectsUsers.length === 0) return 'unknown';
  const projectSlugs = projectsUsers.map(p => (p.project?.slug || '').toLowerCase());
  const hasBorn2beroot = projectSlugs.some(s => s.includes('born2beroot'));
  const hasPushSwap = projectSlugs.some(s => s.includes('push_swap') || s.includes('push-swap'));
  const hasCppModule = projectSlugs.some(s => s.includes('cpp-module') || s.includes('cpp_module'));
  const hasPythonModule = projectSlugs.some(s => s.includes('python'));
  const hasAMazeIng = projectSlugs.some(s => s.includes('maze'));

  if (hasCppModule) return 'old';
  if (hasPythonModule || hasAMazeIng) return 'new';
  if (hasBorn2beroot && !hasPushSwap) return 'old';
  if (hasPushSwap && !hasBorn2beroot) return 'new';

  const born2berootProject = projectsUsers.find(p =>
    (p.project?.slug || '').toLowerCase().includes('born2beroot')
  );
  const pushSwapProject = projectsUsers.find(p =>
    (p.project?.slug || '').toLowerCase().includes('push_swap') ||
    (p.project?.slug || '').toLowerCase().includes('push-swap')
  );

  if (born2berootProject && pushSwapProject) {
    const born2berootDate = new Date(born2berootProject.created_at);
    const pushSwapDate = new Date(pushSwapProject.created_at);
    return born2berootDate < pushSwapDate ? 'old' : 'new';
  }

  return 'unknown';
}

function getGrade(cursusUsers) {
  const cursus42 = cursusUsers?.find(c => c.cursus?.slug === '42cursus' || c.cursus_id === 21);
  return cursus42?.grade || null;
}

class AuthController {
  async redirectTo42(req, res) {
    try {
      const state = Math.random().toString(36).substring(7);
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
      const { code, error } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=access_denied`);
      }

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
      }

      console.log('Authorization code received');
      console.log('Exchanging code for access token...');

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        code: code,
        redirect_uri: oauthConfig.redirectUri
      });

      const tokenResponse = await axios.post(oauthConfig.tokenURL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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

      console.log('Fetching quest data...');
      const questsUsers = await fetchUserQuests(access_token, profile.id);
      const currentCircle = calculateCurrentCircle(questsUsers);
      const curriculum = detectCurriculum(profile.projects_users);
      const grade = getGrade(profile.cursus_users);

      console.log('Quests found:', questsUsers.length);
      console.log('Current circle:', currentCircle);
      console.log('Curriculum:', curriculum);
      console.log('Grade:', grade);

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
        image: profile.image,
        campus: profile.campus?.[0]?.name,
        cursus: profile.cursus_users?.map(c => c.cursus.name) || [],
        wallet: profile.wallet,
        correctionPoints: profile.correction_point,
        correction_point: profile.correction_point,
        level: profile.cursus_users?.find(c => c.cursus.slug === '42cursus')?.level ||
               profile.cursus_users?.[profile.cursus_users.length - 1]?.level || 0,
        cursusUsers: profile.cursus_users || [],
        projectsUsers: profile.projects_users || [],
        questsUsers: questsUsers,
        currentCircle: currentCircle,
        curriculum: curriculum,
        achievements: profile.achievements || [],
        coalition: profile.coalitions?.[0],
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        lastSyncedAt: new Date()
      };

      if (!user) {
        console.log('Creating new user...');
        user = await User.create(userData);
      } else {
        console.log('Updating existing user...');
        Object.assign(user, userData);
        user.lastLogin = new Date();
        await user.save();
      }

      const jwtToken = jwt.sign(
        { userId: user._id, login: user.login, intraId: user.intraId },
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

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (user.lastSyncedAt < oneHourAgo) {
        try {
          const fullUser = await User.findById(req.userId);
          if (fullUser.accessToken) {
            const response = await axios.get(`${oauthConfig.apiURL}/me`, {
              headers: { 'Authorization': `Bearer ${fullUser.accessToken}` }
            });

            const profile = response.data;
            const questsUsers = await fetchUserQuests(fullUser.accessToken, fullUser.intraId);
            const currentCircle = calculateCurrentCircle(questsUsers);
            const curriculum = detectCurriculum(profile.projects_users);

            user.level = profile.cursus_users?.find(c => c.cursus.slug === '42cursus')?.level ||
                         profile.cursus_users?.[profile.cursus_users.length - 1]?.level || 0;
            user.cursusUsers = profile.cursus_users || [];
            user.projectsUsers = profile.projects_users || [];
            user.questsUsers = questsUsers;
            user.currentCircle = currentCircle;
            user.curriculum = curriculum;
            user.wallet = profile.wallet;
            user.correctionPoints = profile.correction_point;
            user.correction_point = profile.correction_point;
            user.image = profile.image;
            user.lastSyncedAt = new Date();
            await user.save();
          }
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
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.accessToken) {
        return res.status(400).json({ error: 'No access token available' });
      }

      const response = await axios.get(`${oauthConfig.apiURL}/me`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });

      const profile = response.data;
      const questsUsers = await fetchUserQuests(user.accessToken, user.intraId);
      const currentCircle = calculateCurrentCircle(questsUsers);
      const curriculum = detectCurriculum(profile.projects_users);

      user.level = profile.cursus_users?.find(c => c.cursus.slug === '42cursus')?.level ||
                   profile.cursus_users?.[profile.cursus_users.length - 1]?.level || 0;
      user.cursusUsers = profile.cursus_users || [];
      user.projectsUsers = profile.projects_users || [];
      user.questsUsers = questsUsers;
      user.currentCircle = currentCircle;
      user.curriculum = curriculum;
      user.wallet = profile.wallet;
      user.correctionPoints = profile.correction_point;
      user.correction_point = profile.correction_point;
      user.campus = profile.campus?.[0]?.name;
      user.avatar = {
        small: profile.image?.versions?.small,
        medium: profile.image?.versions?.medium,
        large: profile.image?.versions?.large
      };
      user.image = profile.image;
      user.lastSyncedAt = new Date();
      await user.save();

      res.json({ message: 'Data refreshed successfully', user: user.toJSON() });
    } catch (error) {
      console.error('Refresh user data error:', error.message);
      res.status(500).json({ error: 'Failed to refresh user data' });
    }
  }

  async logout(req, res) {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to logout' });
    }
  }

  async healthCheck(req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  async getCursusProjects(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        currentCircle: user.currentCircle,
        curriculum: user.curriculum,
        questsUsers: user.questsUsers,
        projectsUsers: user.projectsUsers
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      const currentUser = await User.findById(req.userId);

      if (!q || q.length < 2) {
        return res.json([]);
      }

      const users = await User.find({
        login: { $regex: q, $options: 'i' },
        _id: { $ne: currentUser._id }
      })
      .select('login displayName avatar image campus level')
      .limit(10);

      res.json(users.map(u => ({
        id: u._id,
        login: u.login,
        displayName: u.displayName,
        avatar: u.image?.versions?.small || u.avatar?.small,
        campus: u.campus,
        level: u.level
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
}

module.exports = new AuthController();