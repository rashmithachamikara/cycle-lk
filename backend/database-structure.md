# MongoDB Database Structure for Cycle.LK

This document outlines the database structure for the Cycle.LK bike rental platform, including collections, data models, indexing strategies, and relationships. This version is updated to reflect the latest Mongoose models.

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
  emergencyContact: { name: String, phone: String },
  profileImage: String,
  role: String, // 'user', 'partner', 'admin' (indexed)
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
      documentImage: String,
      submittedAt: Date,
      verifiedAt: Date,
      approvedBy: ObjectId, // User (admin)
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
  userId: ObjectId, // User (indexed)
  companyName: String, // text index
  account: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    totalEarnings: Number,
    totalPaid: Number,
    pendingAmount: Number,
    revenueBreakdown: {
      ownerEarnings: Number,
      pickupEarnings: Number
    }
  },
  category: String,
  description: String, // text index
  location: ObjectId, // Location (indexed)
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
  businessHours: { ... },
  specialties: [String],
  features: [String],
  rating: Number,
  reviews: [{ userId: ObjectId, rating: Number, comment: String, date: Date }],
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
  status: String, // 'active', 'inactive', 'pending' (indexed)
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bikes Collection

```javascript
{
  _id: ObjectId,
  partnerId: ObjectId, // Partner (indexed)
  name: String, // text index
  type: String, // 'city', ... (indexed)
  description: String, // text index
  currentPartnerId: ObjectId, // Partner
  coordinates: { latitude: Number, longitude: Number },
  pricing: { perDay: Number, perWeek: Number, perMonth: Number }, // perDay indexed
  features: [String],
  specifications: { ... },
  images: [{ url: String, publicId: String }],
  availability: {
    status: String,
    reason: String,
    unavailableDates: [Date]
  },
  condition: String, // 'excellent', 'good', 'fair'
  rating: Number,
  reviews: [{ userId: ObjectId, bookingId: ObjectId, rating: Number, comment: String, date: Date, helpful: Number }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Bookings Collection

```javascript
{
  _id: ObjectId,
  bookingNumber: String, // unique
  userId: ObjectId, // User (indexed)
  bikeId: ObjectId, // Bike (indexed)
  partnerId: ObjectId, // Partner (indexed)
  currentBikePartnerId: ObjectId, // Partner
  package: { id: String, name: String, features: [String] },
  pricing: { basePrice: Number, insurance: Number, extras: Number, discount: Number, total: Number, currency: String },
  dates: { startDate: Date, endDate: Date, bookingDate: Date }, // startDate/endDate indexed
  locations: { pickup: String, dropoff: String },
  dropoffPartnerId: ObjectId, // Partner (indexed)
  status: String, // 'requested', ... (indexed)
  paymentStatus: String, // 'pending', ... (indexed)
  payments: {
    initial: { paymentId: ObjectId, amount: Number, percentage: Number, status: String, transactionId: String, paidAt: Date, stripeSessionId: String },
    remaining: { paymentId: ObjectId, amount: Number, percentage: Number, status: String, transactionId: String, paidAt: Date, stripeSessionId: String, additionalCharges: [{ type: String, description: String, amount: Number }] }
  },
  paymentInfo: { method: String, transactionId: String, paid: Boolean, paymentDate: Date, stripeSessionId: String, stripePaymentIntentId: String },
  review: { rating: Number, comment: String, date: Date },
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
  name: String, // unique, text index
  description: String, // text index
  coordinates: { latitude: Number, longitude: Number },
  bikeCount: Number,
  partnerCount: Number,
  popular: Boolean, // indexed
  image: String,
  region: String, // indexed
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Payments Collection

```javascript
{
  _id: ObjectId,
  bookingId: ObjectId, // Booking (indexed)
  userId: ObjectId, // User (indexed)
  partnerId: ObjectId, // Partner (indexed)
  amount: Number,
  totalBookingAmount: Number,
  paymentPercentage: Number,
  currency: String,
  method: String, // 'card', ...
  paymentType: String, // 'initial', ...
  relatedPaymentId: ObjectId, // Payment
  status: String, // 'pending', ... (indexed)
  transactionId: String, // indexed
  cardInfo: { type: String, last4: String, expiryMonth: Number, expiryYear: Number },
  additionalCharges: [{ type: String, description: String, amount: Number }],
  refundInfo: { refunded: Boolean, refundDate: Date, refundAmount: Number, reason: String },
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Reviews Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // User
  bikeId: ObjectId, // Bike
  bookingId: ObjectId, // Booking
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
  userId: ObjectId, // User (indexed)
  type: String, // 'reminder', ... (indexed)
  title: String,
  message: String,
  relatedTo: { type: String, id: ObjectId },
  read: Boolean, // indexed
  sentVia: [String], // 'app', ...
  createdAt: Date
}
```

### 9. Support Collection

```javascript
{
  _id: ObjectId,
  ticketNumber: String, // unique
  userId: ObjectId, // User (indexed)
  subject: String,
  category: String, // 'booking', ... (indexed)
  priority: String, // 'low', ... (indexed)
  message: String,
  attachments: [String],
  status: String, // 'open', ... (indexed)
  assignedTo: ObjectId, // User
  responses: [{
    responder: { id: ObjectId, type: String },
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
  userId: ObjectId, // User (indexed)
  type: String, // 'Visa', ...
  last4: String,
  expiryMonth: Number,
  expiryYear: Number,
  isDefault: Boolean, // indexed
  tokenized: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 11. FAQ Collection

```javascript
{
  _id: ObjectId,
  category: String, // 'booking', ... (indexed)
  question: String, // text index
  answer: String, // text index
  order: Number, // indexed
  active: Boolean, // indexed
  createdAt: Date,
  updatedAt: Date
}
```

### 12. FCMToken Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // User (indexed)
  token: String, // unique index
  userRole: String, // 'user', ...
  deviceInfo: { userAgent: String, platform: String, deviceType: String, appVersion: String },
  isActive: Boolean, // indexed
  lastUsed: Date,
  createdAt: Date
}
```

### 13. ChatbotKnowledge Collection

```javascript
{
  _id: ObjectId,
  category: String, // 'bikes', ... (indexed)
  question: String, // text index
  answer: String, // text index
  keywords: [String], // text index
  intent: String, // indexed
  priority: Number,
  active: Boolean, // indexed
  usageCount: Number,
  lastUsed: Date,
  createdBy: ObjectId, // User
  createdAt: Date,
  updatedAt: Date
}
```

### 14. ChatSession Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // User (indexed)
  sessionId: String, // unique, indexed
  messages: [{
    messageId: String, // unique
    type: String, // 'user', 'bot'
    content: String,
    timestamp: Date,
    intent: String,
    entities: [Object],
    feedback: { rating: Number, helpful: Boolean }
  }],
  context: {
    currentTopic: String,
    userPreferences: Object,
    lastQueryType: String,
    conversationState: Object
  },
  metadata: { userAgent: String, ipAddress: String, platform: String },
  createdAt: Date,
  updatedAt: Date,
  endedAt: Date
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

13. ChatbotKnowledge collection:

- category
- intent
- keywords
- priority
- active
- question (text), answer (text), keywords (text)

14. ChatSession collection:

- userId
- sessionId
- createdAt

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
13. ChatbotKnowledge → User (many-to-one): Knowledge entries are created by users
14. ChatSession → User (many-to-one): Chat sessions are linked to users (or null for guests)
