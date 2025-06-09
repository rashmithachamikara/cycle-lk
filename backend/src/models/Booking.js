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
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'requested'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentInfo: {
    method: String,
    transactionId: String,
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date
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

// Create indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ bikeId: 1 });
bookingSchema.index({ partnerId: 1 });
bookingSchema.index({ 'dates.startDate': 1, 'dates.endDate': 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
