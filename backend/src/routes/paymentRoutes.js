const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create payment
router.post('/', authenticateToken, paymentController.createPayment);

// Get payments by client
router.get('/', authenticateToken, paymentController.getPaymentsByClient);

// Update payment
router.put('/:id', authenticateToken, paymentController.updatePayment);

// Delete payment
router.delete('/:id', authenticateToken, paymentController.deletePayment);

module.exports = router;
