const { Support, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all support tickets with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTickets = asyncHandler(async (req, res) => {
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
});

/**
 * Get support ticket by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Support.findById(req.params.id)
    .populate('userId', 'firstName lastName email phone profileImage')
    .populate('assignedTo', 'firstName lastName')
    .populate('responses.responder.id', 'firstName lastName profileImage');
    
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  
  res.json(ticket);
});

/**
 * Get user tickets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserTickets = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  // Build filter object
  const filter = { userId: req.params.userId };
  
  if (status) filter.status = status;
  
  const tickets = await Support.find(filter).sort({ createdAt: -1 });
  
  res.json(tickets);
});

/**
 * Create a support ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTicket = asyncHandler(async (req, res) => {
  const { subject, category, message, priority } = req.body;
  const userId = req.user.id;
  
  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Generate ticket number
  const ticketCount = await Support.countDocuments();
  const ticketNumber = `TKT-${new Date().getFullYear()}${String(ticketCount + 1).padStart(4, '0')}`;
  
  // Create ticket
  const ticket = new Support({
    ticketNumber,
    userId,
    subject,
    category,
    message,
    priority: priority || 'medium',
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await ticket.save();
  
  res.status(201).json(ticket);
});

/**
 * Update ticket status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid ticket status' });
  }
  
  const ticket = await Support.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  
  ticket.status = status;
  ticket.updatedAt = new Date();
  
  await ticket.save();
  
  res.json(ticket);
});

/**
 * Assign ticket to staff
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.assignTicket = asyncHandler(async (req, res) => {
  const { staffId } = req.body;
  
  // Validate staff exists and has admin/staff role
  const staff = await User.findById(staffId);
  if (!staff) {
    return res.status(404).json({ message: 'Staff user not found' });
  }
  
  if (staff.role !== 'admin' && staff.role !== 'staff') {
    return res.status(400).json({ message: 'User must have admin or staff role' });
  }
  
  const ticket = await Support.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  
  ticket.assignedTo = staffId;
  ticket.updatedAt = new Date();
  
  // If ticket is open, update to in-progress
  if (ticket.status === 'open') {
    ticket.status = 'in-progress';
  }
  
  await ticket.save();
  
  res.json(ticket);
});

/**
 * Add response to ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addResponse = asyncHandler(async (req, res) => {
  const { message, attachments } = req.body;
  const userId = req.user.id;
  
  const ticket = await Support.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  
  // Determine if responder is staff or user
  const user = await User.findById(userId);
  const responderType = (user.role === 'admin' || user.role === 'staff') ? 'staff' : 'user';
  
  const response = {
    responder: {
      id: userId,
      type: responderType
    },
    message,
    attachments: attachments || [],
    createdAt: new Date()
  };
  
  ticket.responses.push(response);
  ticket.updatedAt = new Date();
  
  // If user is responding, change status to open if it's not already
  if (responderType === 'user' && ticket.status !== 'open') {
    ticket.status = 'open';
  } 
  // If staff is responding and ticket is open, change to in-progress
  else if (responderType === 'staff' && ticket.status === 'open') {
    ticket.status = 'in-progress';
  }
  
  await ticket.save();
  
  // Populate the new response with user info
  const updatedTicket = await Support.findById(req.params.id)
    .populate('responses.responder.id', 'firstName lastName profileImage');
  
  res.json(updatedTicket);
});

/**
 * Update ticket priority
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  
  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority level' });
  }
  
  const ticket = await Support.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  
  ticket.priority = priority;
  ticket.updatedAt = new Date();
  
  await ticket.save();
  
  res.json(ticket);
});

/**
 * Close a ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.closeTicket = asyncHandler(async (req, res) => {
  const { resolution } = req.body;
  
  const ticket = await Support.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  
  ticket.status = 'closed';
  ticket.resolution = resolution;
  ticket.closedAt = new Date();
  ticket.updatedAt = new Date();
  
  await ticket.save();
  
  res.json({ 
    message: 'Ticket closed successfully',
    ticket 
  });
});
