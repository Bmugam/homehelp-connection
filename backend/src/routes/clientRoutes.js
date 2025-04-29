const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const clientController = require('../controllers/clientController');

// Provider's clients
router.get('/provider/:providerId', authenticateToken, clientController.getProviderClients);
router.put('/:clientId/status', authenticateToken, clientController.updateClientStatus);
router.post('/:clientId/favorite', authenticateToken, clientController.toggleFavorite);

// New route to update client data
router.put('/:clientId', authenticateToken, clientController.updateClient);

// New route to get client by user ID
router.get('/user/:userId', authenticateToken, clientController.getClientByUserId);

module.exports = router;
