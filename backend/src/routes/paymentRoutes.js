const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, paymentController.createPayment);
router.get('/', authenticateToken, paymentController.getPaymentsByClient);
router.put('/:id', authenticateToken, paymentController.updatePayment);
router.delete('/:id', authenticateToken, paymentController.deletePayment);

module.exports = router;
