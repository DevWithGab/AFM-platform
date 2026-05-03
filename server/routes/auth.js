const express = require('express');
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
