const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  bikeCount: {
    type: Number,
    default: 0
  },
  partnerCount: {
    type: Number,
    default: 0
  },
  popular: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  },
  region: {
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
locationSchema.index({ name: 1 }, { unique: true });
locationSchema.index({ popular: 1 });
locationSchema.index({ region: 1 });
locationSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Location', locationSchema);
