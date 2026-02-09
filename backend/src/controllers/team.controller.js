const prisma = require('../prisma');

const teamController = {
  async createTeam(req, res) {
    try {
      const { name, projectSlug, memberIds } = req.body;

      if (!name || !projectSlug || !memberIds || memberIds.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const team = await prisma.team.create({
        data: {
          name,
          projectId: project.id,
          creatorId: req.userId,
          status: 'pending',
          members: {
            create: [
              { userId: req.userId, status: 'approved' },
              ...memberIds.map(userId => ({ userId: parseInt(userId), status: 'pending' }))
            ]
          }
        },
        include: { members: { include: { user: true } }, project: true, creator: true }
      });

      res.json(team);
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({ error: 'Failed to create team' });
    }
  },

  async getPendingInvites(req, res) {
    try {
      const teams = await prisma.team.findMany({
        where: {
          members: { some: { userId: req.userId, status: 'pending' } },
          creatorId: { not: req.userId }
        },
        include: { members: { include: { user: true } }, project: true, creator: true },
        orderBy: { createdAt: 'desc' }
      });

      const formattedTeams = teams.map(team => ({
        ...team,
        acceptanceCount: team.members.filter(m => m.status === 'approved').length,
        totalMembers: team.members.length
      }));

      res.json(formattedTeams);
    } catch (error) {
      console.error('Get pending invites error:', error);
      res.status(500).json({ error: 'Failed to fetch pending invites' });
    }
  },

  async respondToInvite(req, res) {
    try {
      const { teamId } = req.params;
      const { accept } = req.body;

      const team = await prisma.team.findUnique({
        where: { id: parseInt(teamId) },
        include: { members: true }
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const member = team.members.find(m => m.userId === req.userId);
      if (!member) {
        return res.status(403).json({ error: 'Not a team member' });
      }

      if (accept) {
        await prisma.teamMember.update({
          where: { id: member.id },
          data: { status: 'approved' }
        });

        const updatedTeam = await prisma.team.findUnique({
          where: { id: parseInt(teamId) },
          include: { members: true }
        });

        const allApproved = updatedTeam.members.every(m => m.status === 'approved');
        if (allApproved) {
          await prisma.team.update({
            where: { id: parseInt(teamId) },
            data: { status: 'approved' }
          });
        }

        res.json({
          success: true,
          acceptanceCount: updatedTeam.members.filter(m => m.status === 'approved').length,
          totalMembers: updatedTeam.members.length,
          isActive: allApproved
        });
      } else {
        await prisma.team.delete({ where: { id: parseInt(teamId) } });
        res.json({ deleted: true });
      }
    } catch (error) {
      console.error('Respond to invite error:', error);
      res.status(500).json({ error: 'Failed to respond to invite' });
    }
  },

  async getMyTeams(req, res) {
    try {
      const teams = await prisma.team.findMany({
        where: {
          OR: [
            { members: { some: { userId: req.userId } }, status: 'approved' },
            { creatorId: req.userId, status: 'pending' }
          ]
        },
        include: { members: { include: { user: true } }, project: true, creator: true },
        orderBy: { createdAt: 'desc' }
      });

      const formattedTeams = teams.map(team => {
        const formatted = { ...team };
        if (team.status === 'pending') {
          formatted.acceptanceCount = team.members.filter(m => m.status === 'approved').length;
          formatted.totalMembers = team.members.length;
          formatted.isPending = true;
        }
        return formatted;
      });

      res.json(formattedTeams);
    } catch (error) {
      console.error('Get my teams error:', error);
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  },

  async deleteTeam(req, res) {
    try {
      const { teamId } = req.params;

      const team = await prisma.team.findUnique({ where: { id: parseInt(teamId) } });
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      if (team.creatorId !== req.userId) {
        return res.status(403).json({ error: 'Only creator can delete team' });
      }

      await prisma.team.delete({ where: { id: parseInt(teamId) } });
      res.json({ deleted: true });
    } catch (error) {
      console.error('Delete team error:', error);
      res.status(500).json({ error: 'Failed to delete team' });
    }
  },

  async requestDeleteTeam(req, res) {
    try {
      res.json({ message: 'Delete request feature not yet implemented' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to request deletion' });
    }
  },

  async getDeleteRequests(req, res) {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch delete requests' });
    }
  },

  async respondToDeleteRequest(req, res) {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to respond to delete request' });
    }
  }
};

module.exports = teamController;