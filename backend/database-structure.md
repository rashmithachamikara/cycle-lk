# MongoDB Database Structure for Cycle.LK

This document outlines the database structure for the Cycle.LK bike rental platform, including collections, data models, indexing strategies, and relationships.

## Collections and Data Models

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String, // indexed, unique
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
    phone: Boolean
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
  category: String, // 'Premium', 'Adventure', 'Beach', etc.
  description: String,
  location: String,
  address: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
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
  features: [String], // '24/7 Support', 'Free Delivery', etc.
  rating: Number,
  reviews: [{
    userId: ObjectId,
    rating: Number,
    comment: String,
    date: Date
  }],
  bikeCount: Number, // Updated whenever bikes are added/removed
  yearsActive: Number,
  images: {
    logo: String,
    storefront: String,
    gallery: [String]
  },
  verified: Boolean,
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
  type: String, // 'city', 'mountain', 'road', 'hybrid', 'electric', etc.
  description: String,
  location: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
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
  images: [String], // Array of image URLs
  availability: {
    status: Boolean, // true if generally available
    unavailableDates: [Date] // Dates when bike is not available
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
  bookingNumber: String, // Formatted as 'CL2025XXX'
  userId: ObjectId,
  bikeId: ObjectId,
  partnerId: ObjectId,
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
    currency: String // 'USD', 'LKR', etc.
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
  status: String, // 'requested', 'confirmed', 'active', 'completed', 'cancelled'
  paymentStatus: String, // 'pending', 'paid', 'refunded', 'failed'
  paymentInfo: {
    method: String,
    transactionId: String,
    paid: Boolean,
    paymentDate: Date
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
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  bikeCount: Number, // Updated periodically with aggregation
  partnerCount: Number, // Updated periodically with aggregation
  popular: Boolean,
  image: String, // URL to location image
  region: String, // Geographic region
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
  amount: Number,
  currency: String,
  method: String, // 'credit_card', 'paypal', etc.
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  transactionId: String,
  cardInfo: {
    type: String, // 'Visa', 'Mastercard', etc.
    last4: String,
    expiryMonth: Number,
    expiryYear: Number
  },
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
  userId: {
    type: ObjectId,
    ref: 'User'
  },
  bikeId: {
    type: ObjectId,
    ref: 'Bike'
  },
  bookingId: {
    type: ObjectId,
    ref: 'Booking'
  },
  rating: Number, // 1-5
  comment: String,
  helpful: Number, // Number of people who found the review helpful
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
  type: String, // 'reminder', 'offer', 'system', etc.
  title: String,
  message: String,
  relatedTo: {
    type: String, // 'booking', 'bike', 'partner', etc.
    id: ObjectId
  },
  read: Boolean,
  createdAt: Date,
  sentVia: [String] // 'app', 'email', 'sms'
}
```

### 9. Support Collection
```javascript
{
  _id: ObjectId,
  ticketNumber: String, // Formatted as 'SUPTXXX'
  userId: ObjectId,
  subject: String,
  category: String, // 'booking', 'payment', 'bikes', etc.
  priority: String, // 'low', 'medium', 'high'
  message: String,
  attachments: [String], // URLs to uploaded files
  status: String, // 'open', 'in-progress', 'resolved', 'closed'
  assignedTo: ObjectId, // Staff member ID
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
  type: String, // 'Visa', 'Mastercard', 'PayPal', etc.
  last4: String, // Last 4 digits of card
  expiryMonth: Number,
  expiryYear: Number,
  isDefault: Boolean,
  tokenized: String, // Secure token from payment processor
  createdAt: Date,
  updatedAt: Date
}
```

### 11. FAQ Collection
```javascript
{
  _id: ObjectId,
  category: String, // 'booking', 'payment', 'locations', etc.
  question: String,
  answer: String,
  order: Number, // To determine display order
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexing Strategy

For optimal performance, the following indexes should be created:

1. Users collection:
   - email (unique)
   - role (for filtering users by role)

2. Partners collection:
   - userId (for quick lookup of partner by user)
   - location (for location-based queries)

3. Bikes collection:
   - partnerId (for finding bikes by partner)
   - location (for location-based searches)
   - type (for filtering by bike type)
   - "pricing.perDay" (for price-based filtering)

4. Bookings collection:
   - userId (for finding user's bookings)
   - bikeId (for finding bookings for a bike)
   - partnerId (for finding bookings managed by a partner)
   - "dates.startDate" and "dates.endDate" (for date-based queries)
   - status (for filtering by booking status)

5. Reviews collection:
   - entityId, entityType (composite index for finding reviews for specific entities)

## Data Relationships

The database design uses references (not embedded documents) for most relationships to maintain flexibility and avoid document size limits. Key relationships include:

1. Users → Partners (one-to-one): A user with 'partner' role can have one partner profile
2. Partners → Bikes (one-to-many): A partner can have multiple bikes
3. Users → Bookings (one-to-many): A user can have multiple bookings
4. Bikes → Bookings (one-to-many): A bike can have multiple bookings (at different times)
5. Users → Reviews (one-to-many): A user can leave multiple reviews
6. Bikes/Partners → Reviews (one-to-many): Bikes and partners can receive multiple reviews
