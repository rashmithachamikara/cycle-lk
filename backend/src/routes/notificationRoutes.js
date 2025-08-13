const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth, admin } = require('../middleware/auth');
const { FCMToken } = require('../models');
const { notificationService } = require('../services/notificationService');

/**
 * @route   POST /api/notifications/register-token
 * @desc    Register FCM token for push notifications
 * @access  Private
 */
router.post('/register-token', auth(), async (req, res) => {
  try {
    const { token, userRole, deviceInfo } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    // Save token to database
    const fcmToken = new FCMToken({
      userId,
      token,
      userRole: userRole || req.user.role,
      deviceInfo,
      isActive: true,
      lastUsed: new Date()
    });

    await fcmToken.save();

    // Register token with notification service
    notificationService.registerToken(userId, token, userRole || req.user.role, deviceInfo);

    res.status(201).json({ 
      message: 'FCM token registered successfully',
      tokenId: fcmToken._id
    });
  } catch (error) {
    if (error.code === 11000) {
      // Token already exists, update it
      try {
        await FCMToken.findOneAndUpdate(
          { token: req.body.token },
          { 
            userId: req.user.id,
            userRole: req.body.userRole || req.user.role,
            deviceInfo: req.body.deviceInfo,
            isActive: true,
            lastUsed: new Date()
          }
        );
        
        notificationService.registerToken(
          req.user.id, 
          req.body.token, 
          req.body.userRole || req.user.role, 
          req.body.deviceInfo
        );

        res.json({ message: 'FCM token updated successfully' });
      } catch (updateError) {
        console.error('Error updating FCM token:', updateError);
        res.status(500).json({ message: 'Server error' });
      }
    } else {
      console.error('Error registering FCM token:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

/**
 * @route   DELETE /api/notifications/remove-token
 * @desc    Remove FCM token
 * @access  Private
 */
router.delete('/remove-token', auth(), async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    // Remove from database
    await FCMToken.findOneAndUpdate(
      { userId, token },
      { isActive: false }
    );

    // Remove from notification service
    notificationService.removeToken(userId, token);

    res.json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification (for development)
 * @access  Private
 */
router.post('/test', auth(), async (req, res) => {
  try {
    const { title, body, type, targetUserId } = req.body;
    const userId = targetUserId || req.user.id;

    const notification = {
      title: title || 'Test Notification',
      body: body || 'This is a test notification',
      type: type || 'GENERAL',
      data: {
        testData: 'This is test data',
        timestamp: new Date().toISOString()
      }
    };

    const result = await notificationService.sendToUser(userId, notification);

    res.json({
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', auth(), notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count/:userId
 * @desc    Get count of unread notifications for a user
 * @access  Private
 */
router.get('/unread-count/:userId', auth(), notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:id', auth(), notificationController.getNotificationById);

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private/Admin
 */
router.post('/', auth(), admin, notificationController.createNotification);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create bulk notifications
 * @access  Private/Admin
 */
router.post('/bulk', auth(), admin, notificationController.createBulkNotifications);

/**
 * @route   PUT /api/notifications/:id/mark-read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/mark-read', auth(), notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for a user
 * @access  Private
 */
router.put('/mark-all-read', auth(), notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', auth(), notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications/user/:userId
 * @desc    Delete all notifications for a user
 * @access  Private
 */
router.delete('/user/:userId', auth(), notificationController.deleteAllNotifications);

module.exports = router;
