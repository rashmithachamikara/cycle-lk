// backend/routes/partnerRoutes.js
const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { auth, admin } = require('../middleware/auth');
const { partnerImageUpload, handlePartnerImageUploadErrors } = require('../middleware/partnerImageUpload');
const { partnerDocumentUpload, handlePartnerDocumentUploadErrors } = require('../middleware/partnerDocumentUpload');
const { partnerRegistrationUpload, handlePartnerRegistrationUploadErrors } = require('../middleware/partnerRegistrationUpload');

/**
 * @route   GET /api/partners
 * @desc    Get all partners with optional filtering (locationId, verified)
 * @access  Public
 */
router.get('/', partnerController.getAllPartners);

/**
 * @route   GET /api/partners/search
 * @desc    Search partners by query with optional filters
 * @access  Public
 */
router.get('/search', partnerController.searchPartners);

/**
 * @route   GET /api/partners/location/:locationId
 * @desc    Get partners by location ID
 * @access  Public
 */
router.get('/location/:locationId', partnerController.getPartnersByLocationId);

/**
 * @route   GET /api/partners/:id
 * @desc    Get partner by ID
 * @access  Public
 */
router.get('/:id', partnerController.getPartnerById);

/**
 * @route   POST /api/partners
 * @desc    Register a new partner with image and document upload
 * @access  Private
 */
router.post('/',
  auth(),
  partnerRegistrationUpload,
  handlePartnerRegistrationUploadErrors,
  partnerController.registerPartner
);

/**
 * @route   PUT /api/partners/:id
 * @desc    Update partner information with optional image upload
 * @access  Private/Partner
 */
router.put('/:id', 
  auth(), 
  partnerImageUpload, 
  handlePartnerImageUploadErrors, 
  partnerController.updatePartner
);

/**
 * @route   DELETE /api/partners/:partnerId/gallery/:imageIndex
 * @desc    Delete a specific gallery image
 * @access  Private/Partner
 */
router.delete('/:partnerId/gallery/:imageIndex', 
  auth(), 
  partnerController.deleteGalleryImage
);

/**
 * @route   PUT /api/partners/:id/verification
 * @desc    Update partner verification status (admin only)
 * @access  Private/Admin
 */
router.put('/:id/verification', auth(), admin, partnerController.updateVerificationStatus);

/**
 * @route   GET /api/partners/:id/bikes
 * @desc    Get all bikes for a partner
 * @access  Public
 */
router.get('/:id/bikes', partnerController.getPartnerBikes);

/**
 * @route   PUT /api/partners/:id/bank
 * @desc    Update partner bank details
 * @access  Private/Partner
 */
router.put('/:id/bank', auth(), partnerController.updateBankDetails);

/**
 * @route   POST /api/partners/:partnerId/documents
 * @desc    Upload verification documents for a partner
 * @access  Private/Partner
 */
router.post('/:partnerId/documents', 
  auth(), 
  partnerDocumentUpload, 
  handlePartnerDocumentUploadErrors, 
  partnerController.uploadVerificationDocuments
);

/**
 * @route   GET /api/partners/:partnerId/documents
 * @desc    Get all verification documents for a partner
 * @access  Private/Partner or Admin
 */
router.get('/:partnerId/documents', 
  auth(), 
  partnerController.getVerificationDocuments
);

/**
 * @route   DELETE /api/partners/:partnerId/documents/:documentId
 * @desc    Delete a verification document
 * @access  Private/Partner
 */
router.delete('/:partnerId/documents/:documentId', 
  auth(), 
  partnerController.deleteVerificationDocument
);

/**
 * @route   PUT /api/partners/:partnerId/documents/:documentId/verify
 * @desc    Update document verification status (admin only)
 * @access  Private/Admin
 */
router.put('/:partnerId/documents/:documentId/verify', 
  auth(), 
  admin, 
  partnerController.updateDocumentVerificationStatus
);

/**
 * @route   GET /api/partners/me
 * @desc    Get current partner profile for authenticated user
 * @access  Private/Partner
 */
router.get('/me', auth(), partnerController.getCurrentPartner);

/**
 * @route   GET /api/partners/user/:userId
 * @desc    Get partner by user ID
 * @access  Public (or Private if you want to restrict)
 */
router.get('/user/:userId', partnerController.getPartnerByUserId);
// These routes are now handled in paymentRoutes.js
// router.get('/partner/earnings', getPartnerEarnings);
// router.get('/partner/earnings/:partnerId', getPartnerEarnings);

module.exports = router;