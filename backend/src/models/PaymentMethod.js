const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Visa', 'Mastercard', 'PayPal', 'American Express', 'Other'],
    required: true
  },
  last4: {
    type: String
  },
  expiryMonth: {
    type: Number
  },
  expiryYear: {
    type: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  tokenized: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
paymentMethodSchema.index({ userId: 1 });
paymentMethodSchema.index({ isDefault: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
