// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Users CRUD Routes
router.get('/users', authMiddleware('admin'), adminController.getAllUsers);
router.get('/users/:id', authMiddleware('admin'), adminController.getUserById);
router.post('/users', authMiddleware('admin'), adminController.createUser);
router.put('/users/:id', authMiddleware('admin'), adminController.updateUser);
router.delete('/users/:id', authMiddleware('admin'), adminController.deleteUser);

// Providers CRUD Routes
router.get('/providers', authMiddleware('admin'), adminController.getAllProviders);
router.get('/providers/:id', authMiddleware('admin'), adminController.getProviderById);
router.post('/providers', authMiddleware('admin'), adminController.createProvider);
router.put('/providers/:id', authMiddleware('admin'), adminController.updateProvider);
router.delete('/providers/:id', authMiddleware('admin'), adminController.deleteProvider);

// Services CRUD Routes
router.get('/services', authMiddleware('admin'), adminController.getAllServices);
router.get('/services/:id', authMiddleware('admin'), adminController.getServiceById);
router.post('/services', authMiddleware('admin'), adminController.createService);
router.put('/services/:id', authMiddleware('admin'), adminController.updateService);
router.delete('/services/:id', authMiddleware('admin'), adminController.deleteService);

// Bookings CRUD Routes
router.get('/bookings', authMiddleware('admin'), adminController.getAllBookings);
router.get('/bookings/:id', authMiddleware('admin'), adminController.getBookingById);
router.post('/bookings', authMiddleware('admin'), adminController.createBooking);
router.put('/bookings/:id', authMiddleware('admin'), adminController.updateBooking);
router.delete('/bookings/:id', authMiddleware('admin'), adminController.deleteBooking);

module.exports = router;