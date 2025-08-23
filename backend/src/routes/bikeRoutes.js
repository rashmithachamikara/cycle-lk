// //backend/src/routes/bikeRoutes.js
const express = require('express');
const router = express.Router();
const bikeController = require('../controllers/bikeController');
const { auth, partner } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   GET /api/bikes
 * @desc    Get all bikes with optional filtering
 * @access  Public
 */
router.get('/', bikeController.getAllBikes);

/**
 * @route   GET /api/bikes/featured
 * @desc    Get featured bikes
 * @access  Public
 */
router.get('/featured', bikeController.getFeaturedBikes);

/**
 * @route   GET /api/bikes/my
 * @desc    Get all bikes for the authenticated partner
 * @access  Private/Partner
 */
router.get('/my', auth(['partner']), bikeController.getMyBikes);

/**
 * @route   GET /api/bikes/by-partner/:partnerId
 * @desc    Get all bikes for a specific partner
 * @access  Public
 */
router.get('/by-partner/:partnerId', bikeController.getBikesByPartner);

/**
 * @route   GET /api/bikes/:id
 * @desc    Get bike by ID
 * @access  Public
 */
router.get('/:id', bikeController.getBikeById);


/**
 * @route   POST /api/bikes
 * @desc    Add a new bike with images
 * @access  Private/Partner
 */
router.post('/', auth(), partner, upload.array('images', 5), bikeController.addBike);

/**
 * @route   PUT /api/bikes/:id
 * @desc    Update a bike's details
 * @access  Private/Partner
 */
router.put('/:id', auth(), partner, bikeController.updateBike);

/**
 * @route   POST /api/bikes/:id/images
 * @desc    Upload additional bike images
 * @access  Private/Partner
 */
router.post('/:id/images', auth(), partner, upload.array('images', 5), bikeController.uploadBikeImages);

/**
 * @route   PUT /api/bikes/:id/availability
 * @desc    Update bike availability status
 * @access  Private/Partner
 */
router.put('/:id/availability', auth(), partner, bikeController.updateBikeAvailability);

/**
 * @route   DELETE /api/bikes/:id
 * @desc    Delete a bike
 * @access  Private/Partner
 */
router.delete('/:id', auth(), partner, bikeController.deleteBike);

module.exports = router;