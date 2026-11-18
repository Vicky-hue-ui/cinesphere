const express = require('express');
const router = express.Router();
const { signup, login, getMe, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/auth/register  (alias for /signup — supports both naming conventions)
router.post('/register', signup);
router.post('/signup', signup);

// @route POST /api/auth/login
router.post('/login', login);

// @route POST /api/auth/google
router.post('/google', googleAuth);

// @route GET /api/auth/me (protected)
router.get('/me', protect, getMe);

module.exports = router;
