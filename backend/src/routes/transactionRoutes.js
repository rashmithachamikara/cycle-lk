const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filtering
 * @access  Private/Admin
 */
router.get('/', auth(), admin, transactionController.getAllTransactions);

/**
 * @route   POST /api/transactions
 * @desc    Create manual transaction (for withdrawals, penalties, etc.)
 * @access  Private/Admin
 */
router.post('/', auth(), admin, transactionController.createManualTransaction);

/**
 * @route   GET /api/transactions/partner/:partnerId
 * @desc    Get transaction history for a partner
 * @access  Private
 */
router.get('/partner/:partnerId', auth(), transactionController.getPartnerTransactions);

/**
 * @route   GET /api/transactions/balance/:partnerId
 * @desc    Calculate partner balance from transactions
 * @access  Private
 */
router.get('/balance/:partnerId', auth(), transactionController.calculatePartnerBalance);

/**
 * @route   GET /api/transactions/platform/revenue
 * @desc    Get platform revenue from transactions
 * @access  Private/Admin
 */
router.get('/platform/revenue', auth(), admin, transactionController.getPlatformRevenue);

/**
 * @route   GET /api/transactions/monthly-earnings/:partnerId
 * @desc    Get monthly earnings for a partner
 * @access  Private
 */
router.get('/monthly-earnings/:partnerId', auth(), transactionController.getPartnerMonthlyEarnings);

/**
 * @route   GET /api/transactions/monthly-chart/:partnerId
 * @desc    Get daily revenue chart data for current month
 * @access  Private
 */
router.get('/monthly-chart/:partnerId', auth(), transactionController.getPartnerMonthlyRevenueChart);

/**
 * @route   GET /api/transactions/my-monthly-earnings
 * @desc    Get current user's monthly earnings (for partners)
 * @access  Private
 */
router.get('/my-monthly-earnings', auth(), transactionController.getMyMonthlyEarnings);

/**
 * @route   GET /api/transactions/my-monthly-chart
 * @desc    Get current user's monthly revenue chart (for partners)
 * @access  Private
 */
router.get('/my-monthly-chart', auth(), transactionController.getMyMonthlyRevenueChart);

/**
 * @route   GET /api/transactions/my-revenue-chart
 * @desc    Get current user's revenue chart with flexible period grouping (for partners)
 * @access  Private
 */
router.get('/my-revenue-chart', auth(), transactionController.getMyRevenueChart);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', auth(), transactionController.getTransactionById);

module.exports = router;