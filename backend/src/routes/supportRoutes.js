const express = require('express');
const router = express.Router();
const { Support, User } = require('../models');

/**
 * @route   GET /api/support
 * @desc    Get all support tickets (filtered by various params)
 * @access  Private/Admin
 */
router.get('/', async (req, res) => {
  try {
    const { userId, category, status, priority } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const tickets = await Support.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .sort({ updatedAt: -1 });
      
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/support/:id
 * @desc    Get support ticket by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate('assignedTo', 'firstName lastName')
      .populate('responses.responder.id', 'firstName lastName profileImage');
      
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/support
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Generate ticket number
    const ticketCount = await Support.countDocuments();
    const ticketNumber = `SUP${new Date().getFullYear()}${(ticketCount + 1).toString().padStart(3, '0')}`;
    
    const ticket = new Support({
      ...req.body,
      ticketNumber
    });
    
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/support/:id
 * @desc    Update a support ticket
 * @access  Private/Admin
 */
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/support/:id/response
 * @desc    Add a response to a support ticket
 * @access  Private
 */
router.post('/:id/response', async (req, res) => {
  try {
    const { responder, message, attachments } = req.body;
    
    // Validate required fields
    if (!responder || !responder.id || !responder.type || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const ticket = await Support.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    // Add response to ticket
    ticket.responses.push({
      responder,
      message,
      attachments: attachments || [],
      createdAt: new Date()
    });
    
    // If staff is responding, update status to in-progress
    if (responder.type === 'staff' && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }
    
    ticket.updatedAt = new Date();
    await ticket.save();
    
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/support/:id/resolve
 * @desc    Resolve a support ticket
 * @access  Private/Admin
 */
router.put('/:id/resolve', async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();
    
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/support/:id/assign
 * @desc    Assign a support ticket to a staff member
 * @access  Private/Admin
 */
router.put('/:id/assign', async (req, res) => {
  try {
    const { staffId } = req.body;
    
    // Check if staff member exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(400).json({ message: 'Staff member not found' });
    }
    
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: staffId,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
