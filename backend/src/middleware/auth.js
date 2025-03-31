// middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (requiredRole) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Bearer <token>"
        if (!token) {
            console.error('Access token is missing');
            return res.status(401).json({ message: 'Access token is missing' });
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            console.log('Decoded token during validation:', decoded); // Log decoded token for debugging
            req.user = decoded;

            // Check if the user has the required role
            if (requiredRole && decoded.userType !== requiredRole) {
                console.error(`Forbidden: User role is ${decoded.userType}, required role is ${requiredRole}`);
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            console.error('Token validation error:', error.message);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};