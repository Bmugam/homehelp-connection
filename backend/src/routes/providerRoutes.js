const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', providerController.getAllProviders);
router.get('/:id', providerController.getProviderById);

// Protected booking routes
router.post('/bookings', auth, bookingController.createBooking);
router.get('/bookings/user', auth, bookingController.getUserBookings);

module.exports = router;
