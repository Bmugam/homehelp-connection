// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Dashboard routes
router.get('/dashboard/stats', authenticateToken, isAdmin, adminController.getDashboardStats);

// Dashboard overview routes
router.get('/recent-users', authenticateToken, isAdmin, adminController.getRecentUsers);

// User management routes
router.get('/users/detailed', authenticateToken, isAdmin, adminController.getDetailedUsers);
router.get('/users', authenticateToken, isAdmin, adminController.getAllUsers);
router.post('/users', authenticateToken, isAdmin, adminController.createDetailedUser);
router.put('/users/:id', authenticateToken, isAdmin, adminController.updateDetailedUser);
router.delete('/users/:id', authenticateToken, isAdmin, adminController.deleteUser);

// Provider management routes
router.get('/providers', authenticateToken, isAdmin, adminController.getAllProviders);
router.put('/providers/:id', authenticateToken, isAdmin, adminController.updateProvider);
router.put('/providers/:id/verify', authenticateToken, isAdmin, adminController.verifyProvider);
router.put('/providers/:id/status', authenticateToken, isAdmin, adminController.updateProviderStatus);
router.delete('/providers/:id', authenticateToken, isAdmin, adminController.deleteProvider);

// Services routes
router.get('/services', authenticateToken, isAdmin, adminController.getAllServices);
router.post('/services', authenticateToken, isAdmin, adminController.createService);

// Bookings routes
router.get('/bookings', authenticateToken, isAdmin, adminController.getAllBookings);
router.put('/bookings/:id/status', authenticateToken, isAdmin, adminController.updateBookingStatus);

// Activity routes
router.get('/activities', authenticateToken, isAdmin, adminController.getRecentActivities);

module.exports = router;