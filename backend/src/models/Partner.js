// backend/src/models/Partner.js
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  account: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    totalEarnings: { 
      type: Number, 
      default: 0 
    },
    totalPaid: { 
      type: Number, 
      default: 0 
    },
    pendingAmount: { 
      type: Number, 
      default: 0 
    },
    // Add revenue breakdown
    revenueBreakdown: {
      ownerEarnings: { type: Number, default: 0 },
      pickupEarnings: { type: Number, default: 0 }
    }
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: false // or true if always needed
  },
  // New service location system
  mapLocation: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    placeId: {
      type: String
    },
    isMainLocation: {
      type: Boolean,
      default: false
    }
  },
  address: {
    type: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  contactPerson: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  specialties: [String],
  features: [String],
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
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  bikeCount: {
    type: Number,
    default: 0
  },
  yearsActive: {
    type: Number,
    default: 0
  },
  // images: {
  //   logo: String,
  //   storefront: String,
  //   gallery: [String]
  // },
  images: {
    logo: {
      url: String,
      publicId: String
    },
    storefront: {
      url: String,
      publicId: String
    },
    gallery: [
      {
        url: String,
        publicId: String
      }
    ]
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: {
      type: String,
      required: true,
      trim: true
    },
    documentName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
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
},
);

// Create indexes
partnerSchema.index({ userId: 1 });
partnerSchema.index({ location: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ companyName: 'text', description: 'text' });
module.exports = mongoose.model('Partner', partnerSchema);



// City: {
//     type: String,
//     trim: true
//   },
//   coordinates: {
//     lat: {
//       type: Number,
//       required: true
//     },
//     lng: {
//        type: Number,
//        required: true
//       }
//    },