const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const clientController = require('../controllers/clientController');

// Provider's clients
router.get('/provider/:providerId', authenticateToken, clientController.getProviderClients);
router.put('/:clientId/status', authenticateToken, clientController.updateClientStatus);
router.post('/:clientId/favorite', authenticateToken, clientController.toggleFavorite);

module.exports = router;
