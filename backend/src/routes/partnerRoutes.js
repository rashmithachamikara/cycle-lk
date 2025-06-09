const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   GET /api/partners
 * @desc    Get all partners
 * @access  Public
 */
router.get('/', partnerController.getAllPartners);

/**
 * @route   GET /api/partners/:id
 * @desc    Get partner by ID
 * @access  Public
 */
router.get('/:id', partnerController.getPartnerById);

/**
 * @route   POST /api/partners
 * @desc    Register a new partner
 * @access  Private
 */
router.post('/', auth, partnerController.registerPartner);

/**
 * @route   PUT /api/partners/:id
 * @desc    Update partner information
 * @access  Private/Partner
 */
router.put('/:id', auth, partnerController.updatePartner);

/**
 * @route   PUT /api/partners/:id/verification
 * @desc    Update partner verification status (admin only)
 * @access  Private/Admin
 */
router.put('/:id/verification', auth, admin, partnerController.updateVerificationStatus);

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
router.put('/:id/bank', auth, partnerController.updateBankDetails);

module.exports = router;
