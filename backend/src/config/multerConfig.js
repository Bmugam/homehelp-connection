const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base upload directory
const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads');

// Create directories if they don't exist
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize storage directories
['users', 'providers', 'services'].forEach(dir => {
  createDirectoryIfNotExists(path.join(UPLOAD_BASE_DIR, dir));
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = UPLOAD_BASE_DIR;
    
    // Determine the upload directory based on the route or file type
    if (req.baseUrl.includes('/users')) {
      uploadPath = path.join(UPLOAD_BASE_DIR, 'users');
    } else if (req.baseUrl.includes('/providers')) {
      uploadPath = path.join(UPLOAD_BASE_DIR, 'providers');
    } else if (req.baseUrl.includes('/services')) {
      uploadPath = path.join(UPLOAD_BASE_DIR, 'services');
    }

    createDirectoryIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

// Export multer instances
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
  }
});

module.exports = upload;
