const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

// Enhanced debug middleware
router.use((req, res, next) => {
  console.log('\n🔍 Booking Route Request:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body
  });
  
  // Capture response
  const oldSend = res.send;
  res.send = function (data) {
    console.log('📤 Response:', {
      status: res.statusCode,
      data: data
    });
    oldSend.apply(res, arguments);
  };

  next();
});

// Create new booking
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    console.log('📝 Creating new booking...', req.body);
    await bookingController.createBooking(req, res);
  } catch (error) {
    console.error('❌ Create booking error:', error);
    next(error);
  }
});

// Get user bookings
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    console.log('📋 Fetching user bookings...');
    await bookingController.getUserBookings(req, res);
  } catch (error) {
    console.error('❌ Get user bookings error:', error);
    next(error);
  }
});

// Provider appointments
router.get('/provider/:providerId', authenticateToken, async (req, res, next) => {
  try {
    console.log('👤 Fetching provider appointments:', req.params.providerId);
    await bookingController.getProviderAppointments(req, res);
  } catch (error) {
    console.error('❌ Get provider appointments error:', error);
    next(error);
  }
});

// Get all bookings
router.get('/all', authenticateToken, bookingController.getAllBookings);

router.put('/:id', authenticateToken, bookingController.updateBooking);

router.delete('/:id', authenticateToken, bookingController.deleteBooking);

router.patch('/:id/reschedule', authenticateToken, bookingController.updateBooking);

router.post('/:id/status', authenticateToken,(req, res, next) => {
  console.log('Update appointment status route hit with client_id:', req.params.id);
  next();
}, bookingController.updateAppointmentStatus);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('🚨 Booking Route Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    status: 'error',
    message: error.message || 'Internal server error'
  });
});

module.exports = router;
