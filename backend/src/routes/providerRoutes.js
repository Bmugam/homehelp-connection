const express = require('express');
const router = express.Router();
const { getAllProviders, getProvidersByService, getProviderById } = require('../controllers/providerController');

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

router.get('/:id', async (req, res) => {
  try {
    const provider = await getProviderById(req.app.locals.db, req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    console.error('Error in provider route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
