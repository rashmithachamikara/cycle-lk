const { Notification, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserNotifications = asyncHandler(async (req, res) => {
  const { userId, read, type, limit } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  // Build filter object
  const filter = { userId };
  
  if (read !== undefined) {
    filter.read = read === 'true';
  }
  
  if (type) {
    filter.type = type;
  }
  
  let query = Notification.find(filter).sort({ createdAt: -1 });
  
  // Apply limit if provided
  if (limit) {
    query = query.limit(parseInt(limit));
  }
  
  const notifications = await query;
  res.json(notifications);
});

/**
 * Get notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if user is the owner of the notification or an admin
  if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this notification' });
  }
  
  res.json(notification);
});

/**
 * Get count of unread notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.params.userId,
    read: false
  });
  
  res.json({ count });
});

/**
 * Mark notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if user is the owner of the notification
  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this notification' });
  }
  
  notification.read = true;
  await notification.save();
  
  res.json(notification);
});

/**
 * Mark all notifications as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );
  
  res.json({ message: 'All notifications marked as read' });
});

/**
 * Create a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, relatedTo, sentVia } = req.body;
  
  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    relatedTo,
    sentVia: sentVia || ['app'],
    createdAt: new Date()
  });
  
  await notification.save();
  
  // TODO: If sentVia includes email or sms, send through those channels
  
  res.status(201).json(notification);
});

/**
 * Delete a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if user is the owner of the notification
  if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this notification' });
  }
  
  await Notification.deleteOne({ _id: req.params.id });
  
  res.json({ message: 'Notification removed' });
});

/**
 * Delete all notifications for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Ensure user can only delete their own notifications
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete these notifications' });
  }
  
  await Notification.deleteMany({ userId });
  
  res.json({ message: 'All notifications deleted' });
});

/**
 * Create bulk notifications for multiple users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * Admin only function
 */
exports.createBulkNotifications = asyncHandler(async (req, res) => {
  const { userIds, type, title, message, relatedTo, sentVia } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'User IDs array is required' });
  }
  
  // Validate users exist
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    return res.status(400).json({ message: 'One or more users not found' });
  }
  
  // Create notifications
  const notifications = userIds.map(userId => ({
    userId,
    type,
    title,
    message,
    relatedTo,
    sentVia: sentVia || ['app'],
    createdAt: new Date()
  }));
  
  await Notification.insertMany(notifications);
  
  // TODO: If sentVia includes email or sms, send through those channels
  
  res.status(201).json({ 
    message: `${notifications.length} notifications sent successfully`,
    count: notifications.length
  });
});
