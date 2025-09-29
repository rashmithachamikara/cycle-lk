const { Notification, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const firebaseAdmin = require('../config/firebase');

/**
 * Create real-time event in Firestore
 */
const createRealtimeEvent = async (eventData) => {
  try {
    if (!firebaseAdmin) {
      console.log('Firebase not initialized, skipping real-time event');
      return null;
    }

    const db = firebaseAdmin.firestore();
    const docRef = await db.collection('realtimeEvents').add({
      ...eventData,
      timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });

    console.log(`[RealtimeEvents] Created event ${eventData.type} for user ${eventData.targetUserId}`);
    return docRef.id;
  } catch (error) {
    console.error('[RealtimeEvents] Error creating real-time event:', error);
    return null;
  }
};

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
  console.log(`[Notifications] Fetched ${notifications.length} notifications for user ${userId}`);
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
  const { userId, type, title, message, relatedTo, sentVia, createRealtimeEvent: shouldCreateRealtimeEvent } = req.body;
  
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
  
  // Create real-time event if requested
  if (shouldCreateRealtimeEvent) {
    const eventType = mapNotificationTypeToEventType(type, relatedTo?.type);
    if (eventType) {
      await createRealtimeEvent({
        type: eventType,
        targetUserId: userId,
        targetUserRole: user.role,
        data: {
          notificationId: notification._id.toString(),
          title,
          message,
          type,
          relatedTo
        },
        metadata: {
          sourceUserId: req.user?.id,
          sourceUserRole: req.user?.role
        }
      });
    }
  }
  
  // TODO: If sentVia includes email or sms, send through those channels
  
  res.status(201).json(notification);
});

/**
 * Map notification type to real-time event type
 */
const mapNotificationTypeToEventType = (notificationType, relatedToType) => {
  if (notificationType === 'partner' && relatedToType === 'booking') {
    return 'BOOKING_CREATED';
  }
  if (notificationType === 'system' && relatedToType === 'booking') {
    return 'BOOKING_UPDATED';
  }
  if (notificationType === 'payment') {
    return 'PAYMENT_COMPLETED';
  }
  
  // Default to generic notification event
  return 'NOTIFICATION_CREATED';
};

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
  const { userIds, type, title, message, relatedTo, sentVia, createRealtimeEvent: shouldCreateRealtimeEvent } = req.body;
  
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
  
  const createdNotifications = await Notification.insertMany(notifications);
  
  // Create real-time events if requested
  if (shouldCreateRealtimeEvent) {
    const eventType = mapNotificationTypeToEventType(type, relatedTo?.type);
    if (eventType) {
      const eventPromises = users.map((user, index) => 
        createRealtimeEvent({
          type: eventType,
          targetUserId: user._id.toString(),
          targetUserRole: user.role,
          data: {
            notificationId: createdNotifications[index]._id.toString(),
            title,
            message,
            type,
            relatedTo
          },
          metadata: {
            sourceUserId: req.user?.id,
            sourceUserRole: req.user?.role
          }
        })
      );
      
      await Promise.all(eventPromises);
    }
  }
  
  // TODO: If sentVia includes email or sms, send through those channels
  
  res.status(201).json({ 
    message: `${notifications.length} notifications sent successfully`,
    count: notifications.length,
    notifications: createdNotifications
  });
});
