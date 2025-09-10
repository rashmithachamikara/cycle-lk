const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (webhook)
 */
router.post('/webhook', paymentController.handleStripeWebhook);

/**
 * @route   GET /api/payments
 * @desc    Get all payments with optional filtering
 * @access  Private
 */
router.get('/', auth(), paymentController.getAllPayments);

/**
 * @route   GET /api/payments/stats
 * @desc    Get payment statistics
 * @access  Private
 */
router.get('/stats', auth(), paymentController.getPaymentStats);

/**
 * @route   GET /api/payments/pending
 * @desc    Get pending payments for current user
 * @access  Private
 */
router.get('/pending', auth(['user']), paymentController.getPendingPayments);

/**
 * @route   GET /api/payments/verify-session/:sessionId
 * @desc    Verify Stripe session status
 * @access  Private
 */
router.get('/verify-session/:sessionId', auth(), paymentController.verifyStripeSession);

/**
 * @route   POST /api/payments/initial
 * @desc    Process initial payment for a booking
 * @access  Private (User only)
 */
router.post('/initial', auth(['user']), paymentController.processInitialPayment);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', auth(), paymentController.getPaymentById);

/**
 * @route   POST /api/payments
 * @desc    Process a new payment
 * @access  Private
 */
router.post('/', auth(), paymentController.processPayment);

/**
 * @route   PUT /api/payments/:id/status
 * @desc    Update payment status
 * @access  Private/Admin
 */
router.put('/:id/status', auth(), admin, paymentController.updatePaymentStatus);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Process a refund
 * @access  Private/Admin
 */
router.post('/:id/refund', auth(), admin, paymentController.processRefund);

module.exports = router;
