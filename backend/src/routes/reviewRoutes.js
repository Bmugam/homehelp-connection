const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Create a new review
router.post('/', authenticateToken, reviewController.createReview);

// Get reviews for a specific booking
router.get('/booking/:bookingId', authenticateToken, reviewController.getReviewsForBooking);

// Get all reviews by current user
router.get('/user', authenticateToken, reviewController.getUserReviews);

// Get all reviews for a provider
router.get('/provider/:providerId', reviewController.getProviderReviews);

module.exports = router;
