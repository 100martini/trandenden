const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, teamController.createTeam);
router.get('/pending', authMiddleware, teamController.getPendingInvites);
router.patch('/:teamId/respond', authMiddleware, teamController.respondToInvite);
router.get('/my-teams', authMiddleware, teamController.getMyTeams);
router.delete('/:teamId', authMiddleware, teamController.deleteTeam);

module.exports = router;