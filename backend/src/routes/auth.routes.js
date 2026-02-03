const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/42', authController.redirectTo42);
router.get('/callback', authController.handleCallback);
router.get('/health', authController.healthCheck);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.get('/cursus-projects', authMiddleware, authController.getCursusProjects);
router.get('/users/search', authMiddleware, authController.searchUsers);
router.post('/refresh', authMiddleware, authController.refreshUserData);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
