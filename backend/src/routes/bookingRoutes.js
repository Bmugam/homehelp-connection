const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log('Booking route hit:', {
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query
  });
  next();
});

// Create new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Get user bookings
router.get('/', authenticateToken, bookingController.getUserBookings);

// Provider appointments
router.get('/provider/:providerId', authenticateToken, (req, res, next) => {
  console.log('Provider appointments route hit with user_id:', req.params.providerId);
  next();
}, bookingController.getProviderAppointments);

// Get all bookings
router.get('/all', authenticateToken, bookingController.getAllBookings);

module.exports = router;