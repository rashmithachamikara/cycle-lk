const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin, userAccess } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', auth(), admin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', auth(), userAccess(), userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Register a user
 * @access  Public
 */
router.post('/', userController.registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', userController.loginUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.put('/:id', auth(), userAccess(), userController.updateUser);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/:id/password', auth(), userAccess(), userController.changePassword);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', auth(), admin, userController.deleteUser);

module.exports = router;
