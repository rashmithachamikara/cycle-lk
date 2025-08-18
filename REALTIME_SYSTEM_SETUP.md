# Complete Real-time Booking System Setup

This guide shows you how to set up the complete real-time booking system with Firebase for both notifications and live UI updates.

## Architecture Overview

```
User Action (Booking) → Backend API → Firebase Firestore Event → Real-time UI Update
                     ↓
                   FCM Push Notification
```

## What You've Implemented

### 1. **Real-time Event System**

- Firebase Firestore for real-time data sync
- Custom event service for tracking booking events
- Real-time hooks for UI updates

### 2. **Push Notifications**

- Firebase Cloud Messaging (FCM)
- Background service worker
- Cross-platform notifications

### 3. **Event Types**

- `BOOKING_CREATED` - New booking request
- `BOOKING_ACCEPTED` - Booking confirmed
- `BOOKING_REJECTED` - Booking declined
- `BOOKING_COMPLETED` - Rental completed
- `PAYMENT_REQUIRED` - Payment needed

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Firestore Database**
4. Enable **Cloud Messaging**
5. Add web app and get configuration

### 2. Firestore Security Rules

Set up these security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Real-time events collection
    match /realtimeEvents/{eventId} {
      // Users can only read events targeted to them
      allow read: if request.auth != null &&
                  resource.data.targetUserId == request.auth.uid;

      // Only server can write events (via Admin SDK)
      allow write: if false;
    }
  }
}
```

### 3. Environment Configuration

#### Frontend (.env)

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# API Config
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend (.env)

```env
# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Other configs...
MONGODB_URI=mongodb://localhost:27017/cycle-lk
JWT_SECRET=your_jwt_secret
```

### 4. Service Account Setup

1. In Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file
4. Place in `/backend/src/config/firebase-service-account.json`

### 5. Update Service Worker

Edit `/public/firebase-messaging-sw.js` with your config:

```javascript
firebase.initializeApp({
  apiKey: "your_actual_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
});
```

## How It Works

### 1. **User Creates Booking**

```
User Dashboard → API → Database → Firebase Event → Partner Dashboard (Real-time)
                              ↓
                          FCM Notification → Partner Device
```

### 2. **Partner Accepts Booking**

```
Partner Dashboard → API → Database → Firebase Event → User Dashboard (Real-time)
                                  ↓
                              FCM Notification → User Device
```

### 3. **Real-time UI Updates**

**Partner Dashboard:**

- Automatically shows new booking requests
- Updates booking counts in real-time
- Shows notification badges

**User Dashboard:**

- Shows booking status changes immediately
- Updates from "Requested" to "Confirmed"
- Real-time payment notifications

## Testing the System

### 1. **Start Services**

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend-web && npm run dev
```

### 2. **Test Flow**

1. **Login as User** → Create booking request
2. **Check Partner Dashboard** → Should see new request immediately
3. **Partner accepts** → User dashboard updates automatically
4. **Check Notifications** → Both parties get push notifications

### 3. **Debug Tools**

#### Frontend Console:

```javascript
// Check FCM token
localStorage.getItem("fcmToken");

// Check real-time connection
console.log("Real-time connected:", realtimeConnected);
```

#### Backend Logs:

```
[RealtimeEvents] Created event BOOKING_CREATED for user 12345
[FCM] Notification sent successfully
```

### 4. **Test API Endpoints**

```bash
# Test notification
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test notification"}'

# Check event stats (admin only)
curl -X GET http://localhost:5000/api/events/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Troubleshooting

### Common Issues:

1. **Events not updating UI**

   - Check Firestore security rules
   - Verify user authentication
   - Check browser console for errors

2. **Notifications not received**

   - Check VAPID key configuration
   - Verify service worker registration
   - Test notification permissions

3. **Firebase connection failed**
   - Verify environment variables
   - Check network connectivity
   - Ensure project ID is correct

### Debug Steps:

1. **Check Firebase Connection:**

```javascript
// In browser console
console.log("Firebase app:", firebase.apps);
```

2. **Monitor Firestore:**

   - Go to Firebase Console → Firestore
   - Check `realtimeEvents` collection
   - Verify events are being created

3. **Check Service Worker:**

```javascript
// In browser console
navigator.serviceWorker.ready.then((registration) => {
  console.log("SW registered:", registration);
});
```

## Performance Considerations

### 1. **Event Cleanup**

- Events auto-expire after 7 days
- Run cleanup periodically:

```bash
curl -X POST http://localhost:5000/api/events/cleanup \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 2. **Connection Management**

- Real-time listeners auto-disconnect on logout
- Reconnect on app focus/visibility change
- Handle offline/online state

### 3. **Rate Limiting**

- Limit events per user per minute
- Batch multiple updates
- Use debouncing for rapid changes

## Security Notes

1. **Firestore Rules:** Users can only read their own events
2. **FCM Tokens:** Stored securely with user association
3. **API Authentication:** All endpoints require valid JWT
4. **Event Validation:** Server validates all event data

## Production Checklist

- [ ] Firebase project configured for production
- [ ] Environment variables set correctly
- [ ] Firestore security rules deployed
- [ ] Service worker updated with production config
- [ ] FCM VAPID key generated
- [ ] Service account key secured
- [ ] Rate limiting implemented
- [ ] Error monitoring setup
- [ ] Event cleanup scheduled

Your real-time booking system is now complete! Users and partners will see live updates and receive push notifications for all booking events.
