const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for bike images
const bikeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const bikesUploadDir = path.join(uploadDir, 'bikes');
    if (!fs.existsSync(bikesUploadDir)) {
      fs.mkdirSync(bikesUploadDir, { recursive: true });
    }
    cb(null, bikesUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bike-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for user profile images
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const profilesUploadDir = path.join(uploadDir, 'profiles');
    if (!fs.existsSync(profilesUploadDir)) {
      fs.mkdirSync(profilesUploadDir, { recursive: true });
    }
    cb(null, profilesUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WebP image files are allowed!'), false);
  }
};

// Create multer upload instances
const bikeImageUpload = multer({ 
  storage: bikeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter
});

const profileImageUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: imageFileFilter
});

module.exports = {
  bikeImageUpload,
  profileImageUpload
};
