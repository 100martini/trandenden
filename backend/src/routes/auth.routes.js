const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/42', authController.redirectTo42);
router.get('/callback', authController.handleCallback);
router.get('/health', authController.healthCheck);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/refresh', authMiddleware, authController.refreshUserData);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
