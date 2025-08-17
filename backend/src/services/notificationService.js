const firebaseAdmin = require('../config/firebase');

// Notification events
const NOTIFICATION_EVENTS = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_ACCEPTED: 'BOOKING_ACCEPTED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED'
};

class NotificationService {
  constructor() {
    this.fcmTokens = new Map(); // In production, use database
  }

  // Register FCM token for a user
  registerToken(userId, token, userRole, deviceInfo = {}) {
    const tokenData = {
      token,
      userRole,
      deviceInfo,
      registeredAt: new Date(),
      lastUsed: new Date()
    };

    if (!this.fcmTokens.has(userId)) {
      this.fcmTokens.set(userId, []);
    }
    
    const userTokens = this.fcmTokens.get(userId);
    // Remove existing token if it exists
    const existingIndex = userTokens.findIndex(t => t.token === token);
    if (existingIndex !== -1) {
      userTokens.splice(existingIndex, 1);
    }
    
    // Add new token
    userTokens.push(tokenData);
    
    console.log(`FCM token registered for user ${userId}, role: ${userRole}`);
  }

  // Get FCM tokens for a user
  getUserTokens(userId) {
    return this.fcmTokens.get(userId) || [];
  }

  // Send notification to specific user
  async sendToUser(userId, notification) {
    try {
      const userTokens = this.getUserTokens(userId);
      
      if (userTokens.length === 0) {
        console.log(`No FCM tokens found for user ${userId}`);
        return { success: false, message: 'No FCM tokens found' };
      }

      const tokens = userTokens.map(tokenData => tokenData.token);
      return await this.sendMulticast(tokens, notification);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple users
  async sendToMultipleUsers(userIds, notification) {
    try {
      const allTokens = [];
      
      userIds.forEach(userId => {
        const userTokens = this.getUserTokens(userId);
        userTokens.forEach(tokenData => {
          allTokens.push(tokenData.token);
        });
      });

      if (allTokens.length === 0) {
        console.log('No FCM tokens found for any users');
        return { success: false, message: 'No FCM tokens found' };
      }

      return await this.sendMulticast(allTokens, notification);
    } catch (error) {
      console.error('Error sending notification to multiple users:', error);
      return { success: false, error: error.message };
    }
  }

  // Send multicast notification
  async sendMulticast(tokens, notification) {
    try {
      if (!firebaseAdmin) {
        throw new Error('Firebase Admin not initialized');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          type: notification.type || 'GENERAL',
          timestamp: new Date().toISOString(),
          ...notification.data
        },
        tokens: tokens
      };

      const response = await firebaseAdmin.messaging().sendMulticast(message);
      
      console.log('Successfully sent notifications:', response.successCount);
      console.log('Failed to send notifications:', response.failureCount);

      // Handle failed tokens (optional: remove invalid tokens)
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
            // TODO: Remove invalid tokens from storage
          }
        });
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  // Booking-specific notification methods
  async notifyBookingCreated(booking, partnerId) {
    const notification = {
      title: 'New Booking Request!',
      body: `New booking request for ${booking.bikeId?.name || 'bike'}`,
      type: NOTIFICATION_EVENTS.BOOKING_CREATED,
      data: {
        bookingId: booking._id.toString(),
        bikeId: booking.bikeId?._id?.toString(),
        userId: booking.userId.toString(),
        userRole: 'partner'
      }
    };

    return await this.sendToUser(partnerId, notification);
  }

  async notifyBookingAccepted(booking, userId) {
    const notification = {
      title: 'Booking Confirmed!',
      body: `Your booking for ${booking.bikeId?.name || 'bike'} has been confirmed`,
      type: NOTIFICATION_EVENTS.BOOKING_ACCEPTED,
      data: {
        bookingId: booking._id.toString(),
        bikeId: booking.bikeId?._id?.toString(),
        partnerId: booking.partnerId.toString(),
        userRole: 'user'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  async notifyBookingRejected(booking, userId) {
    const notification = {
      title: 'Booking Declined',
      body: `Your booking request for ${booking.bikeId?.name || 'bike'} has been declined`,
      type: NOTIFICATION_EVENTS.BOOKING_REJECTED,
      data: {
        bookingId: booking._id.toString(),
        bikeId: booking.bikeId?._id?.toString(),
        partnerId: booking.partnerId.toString(),
        userRole: 'user'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  async notifyPaymentRequired(booking, userId) {
    const notification = {
      title: 'Payment Required',
      body: `Please complete payment for your booking of ${booking.bikeId?.name || 'bike'}`,
      type: NOTIFICATION_EVENTS.PAYMENT_REQUIRED,
      data: {
        bookingId: booking._id.toString(),
        bikeId: booking.bikeId?._id?.toString(),
        amount: booking.pricing?.total?.toString(),
        userRole: 'user'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  async notifyBookingCompleted(booking, userId, partnerId) {
    const userNotification = {
      title: 'Booking Completed',
      body: `Your rental of ${booking.bikeId?.name || 'bike'} has been completed. Please rate your experience!`,
      type: NOTIFICATION_EVENTS.BOOKING_COMPLETED,
      data: {
        bookingId: booking._id.toString(),
        bikeId: booking.bikeId?._id?.toString(),
        userRole: 'user'
      }
    };

    const partnerNotification = {
      title: 'Rental Completed',
      body: `Rental of ${booking.bikeId?.name || 'bike'} has been completed`,
      type: NOTIFICATION_EVENTS.BOOKING_COMPLETED,
      data: {
        bookingId: booking._id.toString(),
        bikeId: booking.bikeId?._id?.toString(),
        userRole: 'partner'
      }
    };

    // Send to both user and partner
    const [userResult, partnerResult] = await Promise.all([
      this.sendToUser(userId, userNotification),
      this.sendToUser(partnerId, partnerNotification)
    ]);

    return { userResult, partnerResult };
  }

  // Remove user tokens (on logout, etc.)
  removeUserTokens(userId) {
    this.fcmTokens.delete(userId);
    console.log(`Removed FCM tokens for user ${userId}`);
  }

  // Remove specific token
  removeToken(userId, token) {
    const userTokens = this.fcmTokens.get(userId);
    if (userTokens) {
      const index = userTokens.findIndex(t => t.token === token);
      if (index !== -1) {
        userTokens.splice(index, 1);
        console.log(`Removed FCM token for user ${userId}`);
      }
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = {
  notificationService,
  NOTIFICATION_EVENTS
};
