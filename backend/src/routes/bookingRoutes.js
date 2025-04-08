const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

// Create new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Get user bookings
router.get('/', authenticateToken, bookingController.getUserBookings);

module.exports = router;
