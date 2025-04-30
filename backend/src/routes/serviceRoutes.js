const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/service-categories', serviceController.getServiceCategories);

// Protected routes - require authentication
router.use(authenticateToken);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
