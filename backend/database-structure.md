# MongoDB Database Structure for Cycle.LK

This document outlines the database structure for the Cycle.LK bike rental platform, including collections, data models, indexing strategies, and relationships.

## Collections and Data Models

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String, // indexed, unique, lowercase
  password: String, // hashed
  phone: String,
  dateOfBirth: Date,
  nationality: String,
  address: String,
  emergencyContact: {
    name: String,
    phone: String
  },
  profileImage: String, // URL to image
  role: String, // 'user', 'partner', 'admin'
  status: String, // 'active', 'inactive', 'suspended'
  preferences: {
    bookingUpdates: Boolean,
    promotions: Boolean,
    partnerNews: Boolean,
    smsNotifications: Boolean,
    emailDigest: Boolean
  },
  verificationStatus: {
    email: Boolean,
    phone: Boolean,
    idDocument: {
      isVerified: Boolean,
      status: String, // 'not_submitted', 'pending', 'approved', 'rejected'
      documentType: String, // 'national_id', 'passport', 'driving_license', 'other'
      documentNumber: String,
      documentImage: String, // URL to stored document image
      submittedAt: Date,
      verifiedAt: Date,
      approvedBy: ObjectId, // reference to User (admin)
      rejectionReason: String
    }
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### 2. Partners Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to user who manages this partner account
  companyName: String,
  category: String,
  description: String,
  location: ObjectId, // Reference to Location
  mapLocation: {
    id: String,
    name: String,
    address: String,
    coordinates: { lat: Number, lng: Number },
    placeId: String,
    isMainLocation: Boolean
  },
  address: String,
  coordinates: { latitude: Number, longitude: Number },
  contactPerson: String,
  phone: String,
  email: String,
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
  rating: Number,
  reviews: [{
    userId: ObjectId,
    rating: Number,
    comment: String,
    date: Date
  }],
  bikeCount: Number,
  yearsActive: Number,
  images: {
    logo: { url: String, publicId: String },
    storefront: { url: String, publicId: String },
    gallery: [{ url: String, publicId: String }]
  },
  verified: Boolean,
  verificationDocuments: [{
    documentType: String,
    documentName: String,
    url: String,
    publicId: String,
    uploadedAt: Date,
    verified: Boolean
  }],
  status: String, // 'active', 'inactive', 'pending'
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bikes Collection
```javascript
{
  _id: ObjectId,
  partnerId: ObjectId, // Reference to partner who owns the bike
  name: String,
  type: String, // 'city', 'mountain', 'road', 'hybrid', 'electric', 'touring', 'folding', 'cruiser'
  description: String,
  currentPartnerId: ObjectId, // Reference to Partner (if bike is not in shop)
  coordinates: { latitude: Number, longitude: Number },
  pricing: {
    perDay: Number,
    perWeek: Number,
    perMonth: Number
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
  images: [{ url: String, publicId: String }],
  availability: {
    status: String, // 'available', etc.
    reason: String,
    unavailableDates: [Date]
  },
  condition: String, // 'excellent', 'good', 'fair'
  rating: Number,
  reviews: [{
    userId: ObjectId,
    bookingId: ObjectId,
    rating: Number,
    comment: String,
    date: Date,
    helpful: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Bookings Collection
```javascript
{
  _id: ObjectId,
  bookingNumber: String,
  userId: ObjectId,
  bikeId: ObjectId,
  partnerId: ObjectId,
  currentBikePartnerId: ObjectId,
  package: {
    id: String, // 'day', 'week', 'month'
    name: String,
    features: [String]
  },
  pricing: {
    basePrice: Number,
    insurance: Number,
    extras: Number,
    discount: Number,
    total: Number,
    currency: String
  },
  dates: {
    startDate: Date,
    endDate: Date,
    bookingDate: Date
  },
  locations: {
    pickup: String,
    dropoff: String
  },
  dropoffPartnerId: ObjectId,
  status: String, // 'requested', 'confirmed', 'active', 'completed', 'cancelled'
  paymentStatus: String, // 'pending', 'processing', 'partial_paid', 'fully_paid', 'refunded', 'failed'
  payments: {
    initial: {
      paymentId: ObjectId,
      amount: Number,
      percentage: Number,
      status: String,
      transactionId: String,
      paidAt: Date,
      stripeSessionId: String
    },
    remaining: {
      paymentId: ObjectId,
      amount: Number,
      percentage: Number,
      status: String,
      transactionId: String,
      paidAt: Date,
      stripeSessionId: String,
      additionalCharges: [{
        type: String,
        description: String,
        amount: Number
      }]
    }
  },
  paymentInfo: {
    method: String,
    transactionId: String,
    paid: Boolean,
    paymentDate: Date,
    stripeSessionId: String,
    stripePaymentIntentId: String
  },
  review: {
    rating: Number,
    comment: String,
    date: Date
  },
  qrCode: String,
  note: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Locations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  coordinates: { latitude: Number, longitude: Number },
  bikeCount: Number,
  partnerCount: Number,
  popular: Boolean,
  image: String,
  region: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Payments Collection
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId,
  userId: ObjectId,
  partnerId: ObjectId,
  amount: Number,
  totalBookingAmount: Number,
  paymentPercentage: Number,
  currency: String,
  method: String, // 'card', 'bank_transfer', 'mobile_payment', 'credit_card', 'paypal', 'cash'
  paymentType: String, // 'initial', 'remaining', 'additional_charges', 'refund'
  relatedPaymentId: ObjectId,
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  transactionId: String,
  cardInfo: {
    type: String,
    last4: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  additionalCharges: [{
    type: String,
    description: String,
    amount: Number
  }],
  refundInfo: {
    refunded: Boolean,
    refundDate: Date,
    refundAmount: Number,
    reason: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Reviews Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  bikeId: ObjectId,
  bookingId: ObjectId,
  rating: Number, // 1-5
  comment: String,
  helpful: Number,
  images: [String],
  status: String, // 'published', 'pending', 'rejected'
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // 'reminder', 'offer', 'system', 'partner', 'payment'
  title: String,
  message: String,
  relatedTo: {
    type: String, // 'booking', 'bike', 'partner', 'user', 'payment'
    id: ObjectId
  },
  read: Boolean,
  sentVia: [String], // 'app', 'email', 'sms'
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Support Collection
```javascript
{
  _id: ObjectId,
  ticketNumber: String,
  userId: ObjectId,
  subject: String,
  category: String, // 'booking', 'payment', 'bikes', 'locations', 'safety', 'account', 'other'
  priority: String, // 'low', 'medium', 'high'
  message: String,
  attachments: [String],
  status: String, // 'open', 'in-progress', 'resolved', 'closed'
  assignedTo: ObjectId,
  responses: [{
    responder: {
      id: ObjectId,
      type: String // 'user', 'staff'
    },
    message: String,
    attachments: [String],
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### 10. PaymentMethods Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // 'Visa', 'Mastercard', 'PayPal', 'American Express', 'Other'
  last4: String,
  expiryMonth: Number,
  expiryYear: Number,
  isDefault: Boolean,
  tokenized: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 11. FAQ Collection
```javascript
{
  _id: ObjectId,
  category: String, // 'booking', 'payment', 'locations', 'bikes', 'safety', 'account', 'other'
  question: String,
  answer: String,
  order: Number,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexing Strategy

For optimal performance, the following indexes should be created (as per Mongoose models):

1. Users collection:
  - email (unique)
  - role

2. Partners collection:
  - userId
  - location
  - status
  - companyName (text), description (text)

3. Bikes collection:
  - partnerId
  - location
  - type
  - pricing.perDay
  - name (text), description (text)

4. Bookings collection:
  - userId
  - bikeId
  - partnerId
  - dropoffPartnerId
  - dates.startDate, dates.endDate
  - status
  - paymentStatus
  - payments.initial.status
  - payments.remaining.status

5. Location collection:
  - popular
  - region
  - name (text), description (text)

6. Payment collection:
  - bookingId
  - userId
  - partnerId
  - status
  - transactionId

7. Review collection:
  - (No explicit index in model)

8. Notification collection:
  - userId
  - read
  - type
  - createdAt (descending)

9. Support collection:
  - userId
  - status
  - priority
  - category

10. PaymentMethod collection:
  - userId
  - isDefault

11. FAQ collection:
  - category
  - order
  - active
  - question (text), answer (text)

12. FCMToken collection:
  - userId
  - token (unique)
  - isActive

## Data Relationships

The database design uses references (not embedded documents) for most relationships to maintain flexibility and avoid document size limits. Key relationships include:

1. Users → Partners (one-to-one): A user with 'partner' role can have one partner profile
2. Partners → Bikes (one-to-many): A partner can have multiple bikes
3. Users → Bookings (one-to-many): A user can have multiple bookings
4. Bikes → Bookings (one-to-many): A bike can have multiple bookings (at different times)
5. Users → Reviews (one-to-many): A user can leave multiple reviews
6. Bikes → Reviews (one-to-many): Bikes can receive multiple reviews
7. Partners → Reviews (one-to-many): Partners can receive multiple reviews (via embedded array)
8. Bookings → Payments (one-to-many): A booking can have multiple payments
9. Users → PaymentMethods (one-to-many): A user can have multiple payment methods
10. Users → Notifications (one-to-many): A user can have multiple notifications
11. Users → Support (one-to-many): A user can have multiple support tickets
12. Locations → Partners/Bikes (one-to-many): A location can have multiple partners/bikes
