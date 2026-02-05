const Team = require('../models/team.model');
const User = require('../models/user.model');

exports.createTeam = async (req, res) => {
  try {
    const { name, projectSlug, projectName, memberIds } = req.body;
    const creator = await User.findById(req.userId);
    const creatorId = creator.intraId;

    if (!name || !projectSlug || !projectName || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const memberUsers = await User.find({ _id: { $in: memberIds } });
    
    const team = await Team.create({
      name,
      creatorId,
      project: { slug: projectSlug, name: projectName },
      status: 'pending',
      members: [
        { 
          id: creatorId, 
          login: creator.login, 
          avatar: creator.avatar?.medium || creator.image?.versions?.medium,
          status: 'accepted' 
        },
        ...memberUsers.map(user => ({
          id: user.intraId,
          login: user.login,
          avatar: user.avatar?.medium || user.image?.versions?.medium,
          status: 'pending'
        }))
      ]
    });

    res.json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

exports.getPendingInvites = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;
    
    const teams = await Team.find({
      'members': {
        $elemMatch: {
          id: userId,
          status: 'pending'
        }
      }
    }).sort({ createdAt: -1 });

    const teamsWithCreator = await Promise.all(
      teams.map(async (team) => {
        const creator = await User.findOne({ intraId: team.creatorId });
        return {
          ...team.toObject(),
          creator: {
            login: creator?.login,
            avatar: creator?.avatar?.medium || creator?.image?.versions?.medium
          }
        };
      })
    );

    res.json(teamsWithCreator);
  } catch (error) {
    console.error('Get pending invites error:', error);
    res.status(500).json({ error: 'Failed to fetch pending invites' });
  }
};

exports.respondToInvite = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { accept } = req.body;
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;

    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const memberIndex = team.members.findIndex(m => m.id === userId);
    
    if (memberIndex === -1) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    if (accept) {
      team.members[memberIndex].status = 'accepted';
      
      const allAccepted = team.members.every(m => m.status === 'accepted');
      if (allAccepted) {
        team.status = 'active';
      }
      
      await team.save();
      res.json(team);
    } else {
      await Team.deleteOne({ _id: teamId });
      res.json({ deleted: true });
    }
  } catch (error) {
    console.error('Respond to invite error:', error);
    res.status(500).json({ error: 'Failed to respond to invite' });
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;
    
    const teams = await Team.find({
      'members.id': userId
    }).sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Get my teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;

    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.creatorId !== userId) {
      return res.status(403).json({ error: 'Only creator can delete team' });
    }

    await Team.deleteOne({ _id: teamId });
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
};