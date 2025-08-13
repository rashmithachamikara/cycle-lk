const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
    // Removed unique: true since we're creating the index separately
  },
  userRole: {
    type: String,
    enum: ['user', 'partner', 'admin'],
    required: true
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    deviceType: String,
    appVersion: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
fcmTokenSchema.index({ userId: 1 });
fcmTokenSchema.index({ token: 1 }, { unique: true });
fcmTokenSchema.index({ isActive: 1 });

// Remove old tokens for the same user/device combination
fcmTokenSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Remove existing tokens for the same user and device
    await this.constructor.deleteMany({
      userId: this.userId,
      'deviceInfo.userAgent': this.deviceInfo?.userAgent,
      'deviceInfo.platform': this.deviceInfo?.platform,
      token: { $ne: this.token }
    });
  }
  next();
});

module.exports = mongoose.model('FCMToken', fcmTokenSchema);
