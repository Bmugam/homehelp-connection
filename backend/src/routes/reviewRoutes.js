const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Enhanced logging middleware for review routes
router.use((req, res, next) => {
    console.log('--------------------');
    console.log('📝 Review API Request Details:');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Bearer token present' : 'No token'
    });
    console.log('Body:', req.body);
    console.log('--------------------');
    next();
});

router.post('/', authenticateToken, async (req, res, next) => {
    try {
        console.log('⏳ Creating review with data:', req.body);
        await reviewController.createReview(req, res);
        console.log('✅ Review created successfully');
    } catch (error) {
        console.error('❌ Create review error:', error.message);
        next(error);
    }
});

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        await reviewController.getReviewsByClient(req, res);
        console.log('✅ Reviews retrieved successfully');
    } catch (error) {
        console.error('❌ Get reviews error:', error.message);
        next(error);
    }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
    try {
        await reviewController.updateReview(req, res);
        console.log(`✅ Review ${req.params.id} updated successfully`);
    } catch (error) {
        console.error(`❌ Update review error for ID ${req.params.id}:`, error.message);
        next(error);
    }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
    try {
        await reviewController.deleteReview(req, res);
        console.log(`✅ Review ${req.params.id} deleted successfully`);
    } catch (error) {
        console.error(`❌ Delete review error for ID ${req.params.id}:`, error.message);
        next(error);
    }
});

module.exports = router;
