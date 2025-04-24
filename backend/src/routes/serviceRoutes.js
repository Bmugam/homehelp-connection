const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');
const adminController = require('../controllers/adminController');

// Public routes
router.get('/', adminController.getAllServices);

router.get('/service-categories', serviceController.getServiceCategories);

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [services] = await db.query('SELECT * FROM provider_services WHERE id = ?', [req.params.id]);
    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(services[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
});

module.exports = router;
