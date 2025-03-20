// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Register a new provider
router.post('/register-provider', authController.registerProvider);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', authMiddleware, authController.getCurrentUser);

// Admin route example (protected)
router.get('/admin', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  res.json({ message: 'Welcome to the admin area' });
});

module.exports = router;
