// middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (requiredRole = null) => (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded;
    
    // If a specific role is required, check the user's role
    if (requiredRole && req.user.userType !== requiredRole) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};