const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

// Create new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Get user bookings
router.get('/', authenticateToken, bookingController.getUserBookings);

// Provider appointments
router.get('/provider/:providerId/appointments', authenticateToken, bookingController.getProviderAppointments);

// Get all bookings
router.get('/all', authenticateToken, bookingController.getAllBookings);

module.exports = router;