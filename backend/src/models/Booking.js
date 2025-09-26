const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    required: true
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  package: {
    id: {
      type: String,
      enum: ['day', 'week', 'month'],
      required: true
    },
    name: String,
    features: [String]
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    insurance: Number,
    extras: Number,
    discount: Number,
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  dates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    bookingDate: {
      type: Date,
      default: Date.now
    }
  },
  locations: {
    pickup: {
      type: String,
      required: true
    },
    dropoff: {
      type: String,
      required: true
    }
  },
  dropoffPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'requested'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'partial_paid', 'fully_paid', 'refunded', 'failed'],
    default: 'pending'
  },
  payments: {
    initial: {
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
      },
      amount: Number,
      percentage: {
        type: Number,
        default: 20 // 20% initial payment
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      },
      transactionId: String,
      paidAt: Date,
      stripeSessionId: String
    },
    remaining: {
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
      },
      amount: Number,
      percentage: {
        type: Number,
        default: 80 // 80% remaining payment
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      },
      transactionId: String,
      paidAt: Date,
      stripeSessionId: String,
      additionalCharges: [{
        type: {
          type: String,
          enum: ['damage', 'cleaning', 'late_return', 'fuel', 'other']
        },
        description: String,
        amount: Number
      }]
    }
  },
  // Legacy payment info for backward compatibility
  paymentInfo: {
    method: String,
    transactionId: String,
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    stripeSessionId: String,
    stripePaymentIntentId: String
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  qrCode: String,
  note: String,
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

// Virtual for payment summary
bookingSchema.virtual('paymentSummary').get(function() {
  const initialPaid = this.payments.initial.status === 'completed';
  const remainingPaid = this.payments.remaining.status === 'completed';
  const totalAdditionalCharges = this.payments.remaining.additionalCharges?.reduce(
    (sum, charge) => sum + (charge.amount || 0), 0
  ) || 0;
  
  return {
    initialPaid,
    remainingPaid,
    isFullyPaid: initialPaid && remainingPaid,
    totalPaid: (initialPaid ? this.payments.initial.amount || 0 : 0) + 
               (remainingPaid ? this.payments.remaining.amount || 0 : 0),
    totalAdditionalCharges,
    nextPaymentDue: !initialPaid ? 'initial' : (!remainingPaid ? 'remaining' : null)
  };
});

// Method to calculate payment amounts
bookingSchema.methods.calculatePaymentAmounts = function() {
  const total = this.pricing.total;
  const initialAmount = Math.round(total * (this.payments.initial.percentage / 100) * 100) / 100;
  const remainingAmount = Math.round(total * (this.payments.remaining.percentage / 100) * 100) / 100;
  
  return {
    total,
    initial: initialAmount,
    remaining: remainingAmount
  };
};

// Method to update payment status
bookingSchema.methods.updatePaymentStatus = function() {
  const { initialPaid, remainingPaid, isFullyPaid } = this.paymentSummary;
  
  if (isFullyPaid) {
    this.paymentStatus = 'fully_paid';
  } else if (initialPaid) {
    this.paymentStatus = 'partial_paid';
  } else {
    this.paymentStatus = 'pending';
  }
  
  return this.paymentStatus;
};

// Method to check if booking is ready for drop-off
bookingSchema.methods.canProcessDropOff = function() {
  return this.status === 'active' && 
         this.payments.initial.status === 'completed';
};

// Method to get remaining amount including additional charges
bookingSchema.methods.getRemainingPaymentAmount = function() {
  const amounts = this.calculatePaymentAmounts();
  const additionalCharges = this.payments.remaining.additionalCharges?.reduce(
    (sum, charge) => sum + (charge.amount || 0), 0
  ) || 0;
  
  return amounts.remaining + additionalCharges;
};

// Pre-save middleware to update payment status
bookingSchema.pre('save', function(next) {
  this.updatePaymentStatus();
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Create indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ bikeId: 1 });
bookingSchema.index({ partnerId: 1 });
bookingSchema.index({ dropoffPartnerId: 1 });
bookingSchema.index({ 'dates.startDate': 1, 'dates.endDate': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ 'payments.initial.status': 1 });
bookingSchema.index({ 'payments.remaining.status': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
