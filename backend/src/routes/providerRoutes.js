const express = require('express');
const router = express.Router();
const { getAllProviders } = require('../controllers/providerController');

router.get('/', async (req, res) => {
  try {
    const providers = await getAllProviders(req.app.locals.db);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Error fetching providers' });
  }
});

module.exports = router;
