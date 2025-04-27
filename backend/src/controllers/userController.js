const User = require('../models/User');

const multer = require('multer');
const path = require('path');


// Create a new user
exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update user by ID
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Upload profile image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'backend/uploads/profile_images/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `user_${req.params.id}${ext}`);
    }
});

const upload = multer({ storage: storage });

exports.uploadProfileImage = [
    upload.single('profile_image'),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.profile_image = `/uploads/profile_images/${req.file.filename}`;
            await user.save();
            res.status(200).json({ message: 'Profile image uploaded successfully', profile_image: user.profile_image });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading profile image', error });
        }
    }
];

// Get user notification settings
exports.getUserNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Assuming notification settings are stored in user.notifications or similar
        res.status(200).json(user.notifications || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update user notification settings
exports.updateUserNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update notification settings
        user.notifications = req.body;
        await user.save();
        res.status(200).json(user.notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
