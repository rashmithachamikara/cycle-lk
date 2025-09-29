const { Notification } = require('../models');

/**
 * Safely create a notification with validation
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object|null>} - The created notification or null if failed
 */
const createNotificationSafely = async (notificationData) => {
  try {
    // Validate required fields
    if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
      throw new Error('Missing required fields: userId, type, title, message');
    }

    // Validate notification type
    if (!Notification.isValidType(notificationData.type)) {
      throw new Error(`Invalid notification type: ${notificationData.type}. Valid types: ${Notification.getValidTypes().join(', ')}`);
    }

    // Create notification
    const notification = new Notification(notificationData);
    
    // Validate before saving
    const validationError = notification.validateSync();
    if (validationError) {
      throw validationError;
    }

    // Save notification
    await notification.save();
    
    console.log(`[NotificationHelper] Created ${notificationData.type} notification for user ${notificationData.userId}`);
    return notification;

  } catch (error) {
    console.error('[NotificationHelper] Failed to create notification:', error.message);
    console.error('[NotificationHelper] Notification data:', notificationData);
    return null;
  }
};

/**
 * Create a booking-related notification
 * @param {Object} booking - The booking object
 * @param {string} targetUserId - The user to notify
 * @param {string} eventType - The event type (BOOKING_CREATED, NEW_BOOKING_CREATED_FOR_OWNER, etc.)
 * @returns {Promise<Object|null>} - The created notification or null if failed
 */
const createBookingNotificationSafely = async (booking, targetUserId, eventType) => {
  try {
    let notificationData = {
      userId: targetUserId,
      sentVia: ['app'],
      relatedTo: {
        type: 'booking',
        id: booking._id.toString()
      }
    };

    // Set type, title, and message based on event type
    switch (eventType) {
      case 'BOOKING_CREATED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'New Booking Request',
          message: `You have a new booking request for ${booking.bikeId?.name || 'your bike'}`
        };
        break;

      case 'NEW_BOOKING_CREATED_FOR_OWNER':
        const customerName = booking.userId?.firstName && booking.userId?.lastName 
          ? `${booking.userId.firstName} ${booking.userId.lastName}`
          : 'a customer';
        const partnerName = booking.currentBikePartnerId?.companyName || 'the partner';
        
        notificationData = {
          ...notificationData,
          type: 'owner',
          title: 'New Booking Created',
          message: `A new booking has been created for your bike ${booking.bikeId?.name || 'bike'} at ${partnerName} by ${customerName}`
        };
        break;

      case 'NEW_DROPOFF_BOOKING':
        const userName = booking.userId?.firstName && booking.userId?.lastName 
          ? `${booking.userId.firstName} ${booking.userId.lastName}`
          : 'a customer';
        
        notificationData = {
          ...notificationData,
          type: 'owner',
          title: 'New Drop-off Booking Scheduled',
          message: `A new drop-off booking has been scheduled for the bike ${booking.bikeId?.name || 'bike'} by ${userName}. Expect arrival on ${new Date(booking.dates.endDate).toLocaleDateString()}`
        };
        break;

      case 'BOOKING_ACCEPTED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Booking Confirmed!',
          message: `Your booking for ${booking.bikeId?.name || 'bike'} has been confirmed. Please complete payment.`
        };
        break;

      case 'BOOKING_REJECTED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Booking Declined',
          message: `Your booking request for ${booking.bikeId?.name || 'bike'} has been declined.`
        };
        break;

      case 'BOOKING_COMPLETED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Booking Completed',
          message: `Your rental of ${booking.bikeId?.name || 'bike'} has been completed. Please rate your experience!`
        };
        break;

      case 'PAYMENT_REQUIRED':
        notificationData = {
          ...notificationData,
          type: 'payment',
          title: 'Payment Required',
          message: `Please complete payment of LKR ${booking.pricing?.total || 0} for your booking.`,
          relatedTo: {
            type: 'payment',
            id: booking._id.toString()
          }
        };
        break;

      default:
        console.error('[NotificationHelper] Unknown event type:', eventType);
        return null;
    }

    return await createNotificationSafely(notificationData);

  } catch (error) {
    console.error('[NotificationHelper] Error creating booking notification:', error);
    return null;
  }
};

module.exports = {
  createNotificationSafely,
  createBookingNotificationSafely
};