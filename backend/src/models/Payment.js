const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  totalBookingAmount: {
    type: Number,
    // Total amount for the entire booking
  },
  paymentPercentage: {
    type: Number,
    // Percentage of total amount (e.g., 20 for initial, 80 for remaining)
  },
  currency: {
    type: String,
    default: 'USD'
  },
  method: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_payment', 'credit_card', 'paypal', 'cash']
  },
  paymentType: {
    type: String,
    enum: ['initial', 'remaining', 'additional_charges', 'refund'],
    required: true,
    default: 'initial'
  },
  relatedPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    // Links remaining payment to initial payment
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  cardInfo: {
    type: String,
    last4: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  additionalCharges: [{
    type: {
      type: String,
      enum: ['damage', 'cleaning', 'late_return', 'fuel', 'other']
    },
    description: String,
    amount: Number
  }],
  refundInfo: {
    refunded: {
      type: Boolean,
      default: false
    },
    refundDate: Date,
    refundAmount: Number,
    reason: String
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
}


);

// Create indexes
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ partnerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
