const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesaController');
const { authenticateToken } = require('../middleware/auth');

// Debug middleware for M-Pesa routes
router.use((req, res, next) => {
    console.log('--------------------');
    console.log('[MPESA-ROUTE] Request Details:');
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

// Initialize M-Pesa payment
router.post('/pay', authenticateToken, async (req, res, next) => {
    try {
        console.log('[MPESA-ROUTE] Processing payment request');
        await mpesaController.initiatePayment(req, res);
        console.log('[MPESA-ROUTE] Payment request processed');
    } catch (error) {
        console.error('[MPESA-ROUTE] Payment request error:', error);
        next(error);
    }
});

// M-Pesa callback URL validation endpoint
router.get('/callback', (req, res) => {
    console.log('[MPESA-ROUTE] Callback validation request received');
    res.status(200).json({
        success: true,
        message: 'M-Pesa callback URL is active',
        timestamp: new Date().toISOString()
    });
});

// M-Pesa callback URL for actual transactions
router.post('/callback', async (req, res, next) => {
    try {
        console.log('[MPESA-ROUTE] Processing callback');
        await mpesaController.handleCallback(req, res);
        console.log('[MPESA-ROUTE] Callback processed');
    } catch (error) {
        console.error('[MPESA-ROUTE] Callback error:', error);
        next(error);
    }
});

// Cleanup stale payments endpoint
router.post('/cleanup-stale', async (req, res, next) => {
    try {
        console.log('[MPESA-ROUTE] Running manual cleanup of stale payments');
        await mpesaService.cleanupStalePendingPayments(req.app.locals.db);
        res.json({ success: true, message: 'Cleanup completed successfully' });
    } catch (error) {
        console.error('[MPESA-ROUTE] Cleanup error:', error);
        next(error);
    }
});

module.exports = router;