const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  nationality: {
    type: String
  },
  address: {
    type: String
  },
  emergencyContact: {
    name: {
      type: String
    },
    phone: {
      type: String
    }
  },
  profileImage: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'partner', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  preferences: {
    bookingUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: false
    },
    partnerNews: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    emailDigest: {
      type: Boolean,
      default: true
    }
  },
  verificationStatus: {
    email: {
      type: Boolean,
      default: false
    },
    phone: {
      type: Boolean,
      default: false
    },
    idDocument: {
      isVerified: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
      },
      documentType: {
        type: String,
        enum: ['national_id', 'passport', 'driving_license', 'other'],
      },
      documentNumber: {
        type: String
      },
      documentImage: {
        type: String // URL to stored document image
      },
      submittedAt: {
        type: Date
      },
      verifiedAt: {
        type: Date
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rejectionReason: {
        type: String
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
