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
      members: {
        $elemMatch: { id: userId, status: 'pending' }
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

    const memberIndex = team.members.findIndex(m => Number(m.id) === Number(userId));

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

    const teamsWithDeleteInfo = teams.map(team => {
      const teamObj = team.toObject();
      
      if (teamObj.deleteRequest && teamObj.deleteRequest.requestedBy) {
        teamObj.hasPendingDelete = true;
        teamObj.deleteRequestedBy = teamObj.deleteRequest.requestedByLogin;
      }
      
      return teamObj;
    });

    res.json(teamsWithDeleteInfo);
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

    if (Number(team.creatorId) !== Number(userId)) {
      return res.status(403).json({ error: 'Only creator can delete team' });
    }

    await Team.deleteOne({ _id: teamId });
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

exports.requestDeleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember = team.members.some(m => Number(m.id) === Number(userId));
    if (!isMember) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    // If only one member (solo), delete directly
    if (team.members.length === 1) {
      await Team.deleteOne({ _id: teamId });
      return res.json({ deleted: true });
    }

    // Check if there's already a pending delete request
    if (team.deleteRequest && team.deleteRequest.requestedBy) {
      return res.status(400).json({ error: 'Delete request already pending' });
    }

    const deleteRequest = {
      teamName: team.name,
      project: {
        slug: team.project.slug,
        name: team.project.name
      },
      requestedBy: userId,
      requestedByLogin: currentUser.login,
      approvals: [userId],
      rejections: []
    };

    team.deleteRequest = deleteRequest;
    await team.save();

    res.json({ message: 'Delete request created', deleteRequest });
  } catch (error) {
    console.error('Request delete error:', error);
    res.status(500).json({ error: 'Failed to request deletion' });
  }
};

exports.getDeleteRequests = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;

    // Query only teams with a valid deleteRequest
    const teams = await Team.find({
      'members.id': userId,
      'deleteRequest.requestedBy': { $exists: true, $ne: null, $type: 'number' },
      'deleteRequest.requestedByLogin': { $exists: true, $ne: null, $ne: '' }
    });

    const requests = [];
    
    for (const team of teams) {
      // Skip if requester is current user
      if (Number(team.deleteRequest.requestedBy) === Number(userId)) {
        continue;
      }
      
      // Skip if missing required data
      if (!team.deleteRequest.requestedByLogin || !team.deleteRequest.teamName) {
        continue;
      }
      
      requests.push({
        _id: team._id,
        teamId: team._id,
        teamName: team.deleteRequest.teamName || team.name,
        project: team.deleteRequest.project || team.project,
        requestedBy: {
          id: team.deleteRequest.requestedBy,
          login: team.deleteRequest.requestedByLogin
        },
        approvals: team.deleteRequest.approvals || [],
        rejections: team.deleteRequest.rejections || [],
        totalMembers: team.members.length,
        approvalCount: (team.deleteRequest.approvals || []).length
      });
    }

    res.json(requests);
  } catch (error) {
    console.error('Get delete requests error:', error);
    res.status(500).json({ error: 'Failed to fetch delete requests' });
  }
};

exports.respondToDeleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { accept } = req.body;
    const currentUser = await User.findById(req.userId);
    const userId = currentUser.intraId;

    const team = await Team.findById(requestId);

    if (!team || !team.deleteRequest || !team.deleteRequest.requestedBy) {
      return res.status(404).json({ error: 'Delete request not found' });
    }

    if (accept) {
      // Add to approvals if not already there (use Number for comparison)
      const alreadyApproved = team.deleteRequest.approvals.some(
        id => Number(id) === Number(userId)
      );
      
      if (!alreadyApproved) {
        team.deleteRequest.approvals.push(userId);
      }

      // Remove from rejections if was there
      team.deleteRequest.rejections = team.deleteRequest.rejections.filter(
        id => Number(id) !== Number(userId)
      );

      // Check if ALL members have approved (compare as Numbers)
      const allApproved = team.members.every(member => 
        team.deleteRequest.approvals.some(
          approvalId => Number(approvalId) === Number(member.id)
        )
      );

      console.log('Delete request status:', {
        totalMembers: team.members.length,
        approvals: team.deleteRequest.approvals,
        memberIds: team.members.map(m => m.id),
        allApproved
      });

      if (allApproved) {
        await Team.deleteOne({ _id: team._id });
        return res.json({ deleted: true });
      }

      await team.save();
      res.json({ 
        success: true, 
        approvalCount: team.deleteRequest.approvals.length,
        totalMembers: team.members.length
      });
    } else {
      // If ANY member rejects, cancel the delete request
      team.deleteRequest = undefined;
      await team.save();
      res.json({ success: true, cancelled: true });
    }
  } catch (error) {
    console.error('Respond to delete request error:', error);
    res.status(500).json({ error: 'Failed to respond to delete request' });
  }
};