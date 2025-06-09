const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'bikes', 'locations', 'safety', 'account', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  attachments: [String],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [{
    responder: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['user', 'staff'],
        required: true
      }
    },
    message: {
      type: String,
      required: true
    },
    attachments: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
}, {
  timestamps: true
});

// Create indexes
supportSchema.index({ userId: 1 });
supportSchema.index({ ticketNumber: 1 }, { unique: true });
supportSchema.index({ status: 1 });
supportSchema.index({ priority: 1 });
supportSchema.index({ category: 1 });

module.exports = mongoose.model('Support', supportSchema);
