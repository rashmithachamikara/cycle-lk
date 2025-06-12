const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth, admin } = require('../middleware/auth');

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
