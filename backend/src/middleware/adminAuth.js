const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists and is admin
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

module.exports = isAdmin;
