// backend/middleware/partnerImageUpload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for partner images
const partnerImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on field name
    let folder = 'cycle-lk/partners';
    if (file.fieldname === 'logo') {
      folder = 'cycle-lk/partners/logos';
    } else if (file.fieldname === 'storefront') {
      folder = 'cycle-lk/partners/storefronts';
    } else if (file.fieldname === 'gallery') {
      folder = 'cycle-lk/partners/gallery';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        {
          width: file.fieldname === 'logo' ? 400 : 1200,
          height: file.fieldname === 'logo' ? 400 : 800,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ],
      // Generate unique filename
      public_id: `${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1E9)}`
    };
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with field-specific limits
const partnerImageUpload = multer({
  storage: partnerImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 12 // Maximum total files (1 logo + 1 storefront + 10 gallery)
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'storefront', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

// Error handling middleware
const handlePartnerImageUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB per image.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 1 logo, 1 storefront, and 10 gallery images.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field. Only logo, storefront, and gallery images are allowed.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'Only image files (JPEG, PNG, WebP) are allowed.'
    });
  }
  
  console.error('Partner image upload error:', error);
  return res.status(500).json({
    message: 'Error uploading images. Please try again.'
  });
};

module.exports = {
  partnerImageUpload,
  handlePartnerImageUploadErrors
};