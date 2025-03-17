const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    User.findById(req.userId, (err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        if (!user) {
            return res.status(404).send({ message: 'User Not found.' });
        }
        if (user.role !== 'admin') {
            return res.status(403).send({ message: 'Require Admin Role!' });
        }
        next();
    });
};

module.exports = {
    verifyToken,
    isAdmin
};