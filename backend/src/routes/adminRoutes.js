const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/verifications/pending
 * @desc    Get all pending ID document verifications (Admin only)
 * @access  Private/Admin
 */
router.get('/verifications/pending', auth(), admin, userController.getPendingVerifications);

module.exports = router;
