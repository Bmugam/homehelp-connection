const express = require('express');
const router = express.Router();
const { initiatePayment, handleCallback } = require('../controllers/mpesaController');
const { authenticateToken } = require('../middleware/auth');





router.post('/initiate', authenticateToken, (req, res, next) => {
    console.log('POST /api/mpesa/initiate called with body:', req.body);
    next();
}, initiatePayment);

router.post('/callback', (req, res, next) => {
    console.log('POST /api/mpesa/callback called with body:', req.body);
    next();
}, handleCallback);

module.exports = router;

module.exports = router;