const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for partner documents
const partnerDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'cycle-lk/partners/documents',
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      resource_type: 'auto', // Automatically detect resource type
      // Generate unique filename
      public_id: `doc_${Date.now()}_${Math.round(Math.random() * 1E9)}`
    };
  }
});

// File filter function for documents
const documentFileFilter = (req, file, cb) => {
  // Check if file is a document or image
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and image files are allowed for documents!'), false);
  }
};

// Configure multer for document upload
const partnerDocumentUpload = multer({
  storage: partnerDocumentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 documents at once
  }
}).array('documents', 5);

// Error handling middleware for document upload
const handlePartnerDocumentUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB per document.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 5 documents at once.'
      });
    }
  }
  
  if (error.message === 'Only PDF, DOC, DOCX, and image files are allowed for documents!') {
    return res.status(400).json({
      message: 'Only PDF, DOC, DOCX, and image files are allowed for verification documents.'
    });
  }
  
  console.error('Partner document upload error:', error);
  return res.status(500).json({
    message: 'Error uploading documents. Please try again.'
  });
};

module.exports = {
  partnerDocumentUpload,
  handlePartnerDocumentUploadErrors
};
