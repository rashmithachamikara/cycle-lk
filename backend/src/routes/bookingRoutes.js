const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, partner, admin } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with optional filtering
 * @access  Private
 */
router.get('/', auth(), bookingController.getAllBookings);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings for the authenticated partner
 * @access  Private/Partner/Admin/user
 * @note    This route allows users to see their own bookings, partners to see their bookings
 */
router.get('/my-bookings', auth(['user', 'partner', 'admin']), bookingController.getMyBookings);

/**
 * @route   GET /api/bookings/partner/:partnerId
 * @desc    Get all bookings for a specific partner
 * @access  Private/Partner/Admin
 */
router.get('/partner/:partnerId', auth(['partner', 'admin']), bookingController.getBookingsByPartnerId);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', auth(['user', 'partner', 'admin']), bookingController.getBookingById);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', auth(), validateBooking, bookingController.createBooking);

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private/Partner/Admin
 */
router.put('/:id/status', auth(), bookingController.updateBookingStatus);

/**
 * @route   POST /api/bookings/:id/payment
 * @desc    Record payment for a booking
 * @access  Private
 */
router.post('/:id/payment', auth(), bookingController.recordPayment);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.put('/:id/cancel', auth(), bookingController.cancelBooking);

module.exports = router;
