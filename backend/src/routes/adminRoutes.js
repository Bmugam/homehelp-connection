// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Error handling middleware
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply middleware to all admin routes
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard routes
router.get('/dashboard/stats', asyncHandler(adminController.getDashboardStats));
router.get('/recent-users', asyncHandler(adminController.getRecentUsers));

// Users management
router.get('/users', asyncHandler(adminController.getAllUsers));
router.get('/users/:id', asyncHandler(adminController.getUserById));
router.post('/users', asyncHandler(adminController.createUser));
router.put('/users/:id', asyncHandler(adminController.updateUser));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

// Providers CRUD Routes
router.get('/providers', asyncHandler(adminController.getAllProviders));
router.get('/providers/:id', asyncHandler(adminController.getProviderById));
router.post('/providers', asyncHandler(adminController.createProvider));
router.put('/providers/:id', asyncHandler(adminController.updateProvider));
router.delete('/providers/:id', asyncHandler(adminController.deleteProvider));

// Services CRUD Routes
router.get('/services', asyncHandler(adminController.getAllServices));
router.get('/services/:id', asyncHandler(adminController.getServiceById));
router.post('/services', asyncHandler(adminController.createService));
router.put('/services/:id', asyncHandler(adminController.updateService));
router.delete('/services/:id', asyncHandler(adminController.deleteService));

// Bookings CRUD Routes
router.get('/bookings', asyncHandler(adminController.getAllBookings));
router.get('/bookings/:id', asyncHandler(adminController.getBookingById));
router.post('/bookings', asyncHandler(adminController.createBooking));
router.put('/bookings/:id', asyncHandler(adminController.updateBooking));
router.delete('/bookings/:id', asyncHandler(adminController.deleteBooking));

// Additional Admin Routes
router.get('/activities', asyncHandler(adminController.getAdminActivities));

// Add error logging
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  res.status(500).json({ 
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;