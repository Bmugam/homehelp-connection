const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Middleware to handle image deletion
const deleteImage = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      resolve();
      return;
    }

    const fullPath = path.join(__dirname, '../../uploads', filePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        // If file doesn't exist, don't throw error
        if (err.code === 'ENOENT') {
          resolve();
          return;
        }
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Middleware to process uploaded image path
const processUploadedImage = (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  // Convert backslashes to forward slashes and get relative path
  const relativePath = req.file.path
    .split('uploads\\')[1]
    .replace(/\\/g, '/');
    
  // Create full URL for the image
  const imageUrl = `${config.API_URL}/uploads/${relativePath}`;
  
  req.uploadedImagePath = imageUrl;
  next();
};

module.exports = {
  deleteImage,
  processUploadedImage
};
