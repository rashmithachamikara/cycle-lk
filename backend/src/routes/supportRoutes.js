const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { auth, admin } = require('../middleware/auth');

/**
 * @route   GET /api/support
 * @desc    Get all support tickets (filtered by various params)
 * @access  Private/Admin
 */
router.get('/', auth(), admin, supportController.getAllTickets);

/**
 * @route   GET /api/support/:id
 * @desc    Get support ticket by ID
 * @access  Private
 */
router.get('/:id', auth(), supportController.getTicketById);

/**
 * @route   GET /api/support/user/:userId
 * @desc    Get user tickets
 * @access  Private
 */
router.get('/user/:userId', auth(), supportController.getUserTickets);

/**
 * @route   POST /api/support
 * @desc    Create a support ticket
 * @access  Private
 */
router.post('/', auth(), supportController.createTicket);

/**
 * @route   PUT /api/support/:id/status
 * @desc    Update ticket status
 * @access  Private/Admin
 */
router.put('/:id/status', auth(), admin, supportController.updateTicketStatus);

/**
 * @route   PUT /api/support/:id/assign
 * @desc    Assign ticket to staff
 * @access  Private/Admin
 */
router.put('/:id/assign', auth(), admin, supportController.assignTicket);

/**
 * @route   POST /api/support/:id/response
 * @desc    Add response to ticket
 * @access  Private
 */
router.post('/:id/response', auth, supportController.addResponse);

/**
 * @route   PUT /api/support/:id/priority
 * @desc    Update ticket priority
 * @access  Private/Admin
 */
router.put('/:id/priority', auth, admin, supportController.updatePriority);

/**
 * @route   PUT /api/support/:id/close
 * @desc    Close a ticket
 * @access  Private
 */
router.put('/:id/close', auth, supportController.closeTicket);

module.exports = router;
