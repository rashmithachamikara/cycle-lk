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
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', auth(), transactionController.getTransactionById);

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

module.exports = router;