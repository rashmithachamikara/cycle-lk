//backend/src/models/Bike.js
const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['city', 'mountain', 'road', 'hybrid', 'electric', 'touring', 'folding', 'cruiser']
  },
  description: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  pricing: {
    perDay: {
      type: Number,
      required: true
    },
    perWeek: {
      type: Number
    },
    perMonth: {
      type: Number
    }
  },
  features: [String],
  specifications: {
    frameSize: String,
    weight: String,
    gears: String,
    ageRestriction: String,
    maxLoad: String,
    brakeType: String,
    tireSize: String,
    gearSystem: String
  },
  images: [{
    url: String,
    publicId: String
  }],  
  availability: {
    status: {
      type: String,
      default: 'available'
    },
    reason: {
      type: String,
      default: ''
    },
    unavailableDates: [Date]
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    default: 'good'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    helpful: {
      type: Number,
      default: 0
    }
  }],
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
bikeSchema.index({ partnerId: 1 });
bikeSchema.index({ location: 1 });
bikeSchema.index({ type: 1 });
bikeSchema.index({ 'pricing.perDay': 1 });
bikeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Bike', bikeSchema);
