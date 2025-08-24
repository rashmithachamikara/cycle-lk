// //backned/routes/partnerRoutes.js
// const express = require('express');
// const router = express.Router();
// const partnerController = require('../controllers/partnerController');
// const { auth, admin } = require('../middleware/auth');

// /**
//  * @route   GET /api/partners
//  * @desc    Get all partners
//  * @access  Public
//  */
// router.get('/', partnerController.getAllPartners);

// /**
//  * @route   GET /api/partners/:id
//  * @desc    Get partner by ID
//  * @access  Public
//  */
// router.get('/:id', partnerController.getPartnerById);

// /**
//  * @route   POST /api/partners
//  * @desc    Register a new partner
//  * @access  Private
//  */
// router.post('/', auth(), partnerController.registerPartner);

// /**
//  * @route   PUT /api/partners/:id
//  * @desc    Update partner information
//  * @access  Private/Partner
//  */
// router.put('/:id', auth(), partnerController.updatePartner);

// /**
//  * @route   PUT /api/partners/:id/verification
//  * @desc    Update partner verification status (admin only)
//  * @access  Private/Admin
//  */
// router.put('/:id/verification', auth(), admin, partnerController.updateVerificationStatus);

// /**
//  * @route   GET /api/partners/:id/bikes
//  * @desc    Get all bikes for a partner
//  * @access  Public
//  */
// router.get('/:id/bikes', partnerController.getPartnerBikes);

// /**
//  * @route   PUT /api/partners/:id/bank
//  * @desc    Update partner bank details
//  * @access  Private/Partner
//  */
// router.put('/:id/bank', auth(), partnerController.updateBankDetails);

// module.exports = router;



// backend/routes/partnerRoutes.js
const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { auth, admin } = require('../middleware/auth');
const { partnerImageUpload, handlePartnerImageUploadErrors } = require('../middleware/partnerImageUpload');

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
 * @desc    Register a new partner with image upload
 * @access  Private
 */
router.post('/', 
  auth(), 
  partnerImageUpload, 
  handlePartnerImageUploadErrors, 
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

module.exports = router;