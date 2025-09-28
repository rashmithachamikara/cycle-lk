const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    default: null // null for platform transactions
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null // null for non-payment transactions (withdrawals, etc.)
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null // null for non-booking transactions
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Earnings
      'owner_earnings',
      'pickup_earnings',
      'bonus_payment',
      'referral_commission',
      // Deductions
      'withdrawal',
      'refund_deduction',
      'penalty_fee',
      'platform_fee_adjustment',
      'chargeback',
      // Platform
      'platform_fee'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['earning', 'deduction']
  },
  amount: {
    type: Number,
    required: true
    // Positive for earnings, negative for deductions
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
transactionSchema.index({ partnerId: 1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ createdAt: -1 });

// Compound indexes for common queries
transactionSchema.index({ partnerId: 1, createdAt: -1 });
transactionSchema.index({ partnerId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);