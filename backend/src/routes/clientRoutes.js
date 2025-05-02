const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../config/multerConfig');
const clientController = require('../controllers/clientController');
const {processUploadedImage} = require('../middleware/imageHandler');

// Provider's clients
router.get('/provider/:providerId', authenticateToken, async (req, res, next) => {
    try {
        console.log(`Getting clients for provider: ${req.params.providerId}`);
        await clientController.getProviderClients(req, res, next);
        console.log('Successfully retrieved provider clients');
    } catch (error) {
        console.error('Error getting provider clients:', error);
        next(error);
    }
});

router.put('/:clientId/status', authenticateToken, async (req, res, next) => {
    try {
        console.log(`Updating status for client: ${req.params.clientId}`);
        await clientController.updateClientStatus(req, res, next);
        console.log('Successfully updated client status');
    } catch (error) {
        console.error('Error updating client status:', error);
        next(error);
    }
});

router.post('/:clientId/favorite', authenticateToken, async (req, res, next) => {
    try {
        console.log(`Toggling favorite for client: ${req.params.clientId}`);
        await clientController.toggleFavorite(req, res, next);
        console.log('Successfully toggled favorite');
    } catch (error) {
        console.error('Error toggling favorite:', error);
        next(error);
    }
});

// New route to update client data
router.put('/:clientId', authenticateToken, async (req, res, next) => {
    try {
        console.log(`Updating client: ${req.params.clientId}`);
        await clientController.updateClient(req, res, next);
        console.log('Successfully updated client');
    } catch (error) {
        console.error('Error updating client:', error);
        next(error);
    }
});

// New route to get client by user ID
router.get('/user/:userId', authenticateToken, async (req, res, next) => {
    try {
        console.log(`Getting client for user: ${req.params.userId}`);
        await clientController.getClientByUserId(req, res, next);
        console.log('Successfully retrieved client by user ID');
    } catch (error) {
        console.error('Error getting client by user ID:', error);
        next(error);
    }
});




// Add route for uploading profile image using existing multer middleware and auth
router.put('/:clientId/upload-image', authenticateToken, upload.single('profile_image'), processUploadedImage, clientController.updateClientProfileImage);

module.exports = router;
