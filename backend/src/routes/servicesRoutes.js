const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Services endpoints
router.get('/', adminController.getAllServices);
router.get('/:id', adminController.getServiceById);

module.exports = router;
