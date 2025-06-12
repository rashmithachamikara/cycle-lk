const express = require('express');
const router = express.Router();
const bikeController = require('../controllers/bikeController');
const { auth, partner } = require('../middleware/auth');
const { validateBike } = require('../middleware/validation');
const { bikeImageUpload } = require('../utils/fileUpload');

/**
 * @route   GET /api/bikes
 * @desc    Get all bikes with optional filtering
 * @access  Public
 */
router.get('/', bikeController.getAllBikes);

/**
 * @route   GET /api/bikes/:id
 * @desc    Get bike by ID
 * @access  Public
 */
router.get('/:id', bikeController.getBikeById);

/**
 * @route   POST /api/bikes
 * @desc    Add a new bike
 * @access  Private/Partner
 */
router.post('/', auth(), partner, validateBike, bikeController.addBike);

/**
 * @route   POST /api/bikes/:id/images
 * @desc    Upload bike images
 * @access  Private/Partner
 */
router.post('/:id/images', auth(), partner, bikeImageUpload.array('images', 5), bikeController.uploadBikeImages);

/**
 * @route   PUT /api/bikes/:id
 * @desc    Update a bike
 * @access  Private/Partner
 */
router.put('/:id', auth(), partner, bikeController.updateBike);

/**
 * @route   PUT /api/bikes/:id/availability
 * @desc    Update bike availability
 * @access  Private/Partner
 */
router.put('/:id/availability', auth(), partner, bikeController.updateBikeAvailability);

/**
 * @route   DELETE /api/bikes/:id
 * @desc    Delete a bike
 * @access  Private/Partner
 */
router.delete('/:id', auth, partner, bikeController.deleteBike);

module.exports = router;
