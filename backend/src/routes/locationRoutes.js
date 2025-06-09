const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 * @access  Public
 */
router.get('/', locationController.getAllLocations);

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Public
 */
router.get('/:id', locationController.getLocationById);

/**
 * @route   GET /api/locations/search
 * @desc    Search locations by name or city
 * @access  Public
 */
router.get('/search', locationController.searchLocations);

/**
 * @route   POST /api/locations
 * @desc    Create a new location (admin only)
 * @access  Private/Admin
 */
router.post('/', auth, admin, locationController.createLocation);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location (admin only)
 * @access  Private/Admin
 */
router.put('/:id', auth, admin, locationController.updateLocation);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', auth, admin, locationController.deleteLocation);

module.exports = router;
