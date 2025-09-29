const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'offer', 'system', 'partner', 'payment', 'owner'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['booking', 'bike', 'partner', 'user', 'payment']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  sentVia: {
    type: [String],
    enum: ['app', 'email', 'sms'],
    default: ['app']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to validate notification type
notificationSchema.statics.isValidType = function(type) {
  return ['reminder', 'offer', 'system', 'partner', 'payment', 'owner'].includes(type);
};

// Static method to get all valid types
notificationSchema.statics.getValidTypes = function() {
  return ['reminder', 'offer', 'system', 'partner', 'payment', 'owner'];
};

// Pre-save middleware for additional validation
notificationSchema.pre('save', function(next) {
  // Validate notification type
  if (!this.constructor.isValidType(this.type)) {
    const error = new Error(`Invalid notification type: ${this.type}. Valid types are: ${this.constructor.getValidTypes().join(', ')}`);
    return next(error);
  }
  
  // Ensure required fields are present
  if (!this.title || !this.message) {
    const error = new Error('Title and message are required for notifications');
    return next(error);
  }
  
  next();
});

// Create indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
