const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [services] = await db.query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

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
