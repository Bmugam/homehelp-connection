const express = require('express');
const router = express.Router();
const { getAllProviders, getProvidersByService } = require('../controllers/providerController');

router.get('/', async (req, res) => {
  try {
    const providers = await getAllProviders(req.app.locals.db);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Error fetching providers' });
  }
});

router.get('/service/:serviceId', async (req, res) => {
  try {
    const providers = await getProvidersByService(req.app.locals.db, req.params.serviceId);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers by service:', error);
    res.status(500).json({ message: 'Error fetching providers' });
  }
});

module.exports = router;
