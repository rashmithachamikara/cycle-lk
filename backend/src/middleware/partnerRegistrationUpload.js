const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
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
      public_id: `${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1E9)}`
    };
  }
});

// Configure Cloudinary storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'cycle-lk/partners/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
    public_id: `doc_${Date.now()}_${Math.round(Math.random() * 1E9)}`
  })
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (
    (file.fieldname === 'logo' || file.fieldname === 'storefront' || file.fieldname === 'gallery') &&
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  if (file.fieldname === 'documents' && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Combined file filter
const registrationFileFilter = (req, file, cb) => {
  if (
    (file.fieldname === 'logo' || file.fieldname === 'storefront' || file.fieldname === 'gallery') &&
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else if (
    file.fieldname === 'documents' &&
    [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ].includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unexpected file field or file type. Only logo, storefront, gallery images, and verification documents are allowed.'), false);
  }
};

// Storage selector based on fieldname
const registrationStorage = (req, file, cb) => {
  if (file.fieldname === 'logo' || file.fieldname === 'storefront' || file.fieldname === 'gallery') {
    imageStorage._handleFile(req, file, cb);
  } else if (file.fieldname === 'documents') {
    documentStorage._handleFile(req, file, cb);
  } else {
    cb(new Error('Unexpected file field.'), null);
  }
};

// Use multer diskStorage just to pass to multer, but override _handleFile
const dummyStorage = {
  _handleFile: registrationStorage,
  _removeFile: (req, file, cb) => {
    cb(null);
  }
};

const partnerRegistrationUpload = multer({
  storage: dummyStorage,
  fileFilter: registrationFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file (for docs), images will be validated by image middleware
    files: 17 // 1 logo + 1 storefront + 10 gallery + 5 documents
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'storefront', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'documents', maxCount: 5 }
]);

const handlePartnerRegistrationUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 1 logo, 1 storefront, 10 gallery images, and 5 documents.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field. Only logo, storefront, gallery images, and documents are allowed.'
      });
    }
  }
  if (error.message && error.message.startsWith('Unexpected file field')) {
    return res.status(400).json({
      message: error.message
    });
  }
  console.error('Partner registration upload error:', error);
  return res.status(500).json({
    message: 'Error uploading files. Please try again.'
  });
};

module.exports = {
  partnerRegistrationUpload,
  handlePartnerRegistrationUploadErrors
};
