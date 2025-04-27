const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { processUploadedImage } = require('../middleware/imageHandler');
const {
  getAllProviders,
  getProvidersByService,
  getProviderById,
  getProviderServices,
  addProviderService,
  updateProviderService,
  deleteProviderService,
  updateProviderProfile,
  updateProviderAvailability,
  updateProviderProfileImage
} = require('../controllers/providerController');

// Existing routes
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

// New routes for provider services
router.get('/:id/services', async (req, res) => {
  try {
    const services = await getProviderServices(req.app.locals.db, req.params.id);
    res.json(services);
  } catch (error) {
    console.error('Error fetching provider services:', error);
    res.status(500).json({ message: 'Error fetching provider services' });
  }
});

router.post('/:id/services', upload.single('image'), processUploadedImage, async (req, res) => {
  try {
    const serviceData = req.body;
    if (req.uploadedImagePath) {
      serviceData.image = req.uploadedImagePath;
    }
    const newService = await addProviderService(req.app.locals.db, req.params.id, serviceData);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error adding provider service:', error);
    res.status(500).json({ message: 'Error adding provider service' });
  }
});

router.put('/:id/services/:serviceId', upload.single('image'), processUploadedImage, async (req, res) => {
  try {
    const serviceData = req.body;
    if (req.uploadedImagePath) {
      serviceData.image = req.uploadedImagePath;
    }
    const updatedService = await updateProviderService(req.app.locals.db, req.params.id, req.params.serviceId, serviceData);
    res.json(updatedService);
  } catch (error) {
    console.error('Error updating provider service:', error);
    res.status(500).json({ message: 'Error updating provider service' });
  }
});

router.delete('/:id/services/:serviceId', async (req, res) => {
  try {
    await deleteProviderService(req.app.locals.db, req.params.id, req.params.serviceId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting provider service:', error);
    res.status(500).json({ message: 'Error deleting provider service' });
  }
});

// Route to update provider profile
router.put('/:id', async (req, res) => {
  try {
    const updatedProvider = await updateProviderProfile(req.app.locals.db, req.params.id, req.body);
    res.json(updatedProvider);
  } catch (error) {
    console.error('Error updating provider profile:', error);
    res.status(500).json({ message: 'Error updating provider profile' });
  }
});

// Route to update provider availability
router.put('/:id/availability', async (req, res) => {
  try {
    const updatedAvailability = await updateProviderAvailability(req.app.locals.db, req.params.id, req.body);
    res.json(updatedAvailability);
  } catch (error) {
    console.error('Error updating provider availability:', error);
    res.status(500).json({ message: 'Error updating provider availability' });
  }
});

// Route to upload provider profile image
router.put('/:id/upload-image', upload.single('image'), processUploadedImage, async (req, res) => {
  try {
    if (!req.uploadedImagePath) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const updatedProvider = await updateProviderProfileImage(req.app.locals.db, req.params.id, req.uploadedImagePath);
    res.json(updatedProvider);
  } catch (error) {
    console.error('Error uploading provider image:', error);
    res.status(500).json({ message: 'Error uploading provider image' });
  }
});

module.exports = router;
