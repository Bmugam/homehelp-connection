const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get a user by ID
router.get('/:id', userController.getUser);

// Route to update a user by ID
router.put('/:id', userController.updateUser);

// Routes for user notification settings
router.get('/:id/notifications', userController.getUserNotifications);
router.put('/:id/notifications', userController.updateUserNotifications);

router.post('/', userController.createUser); // Route to create a new user

module.exports = router;
