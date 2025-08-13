# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging for push notifications in your Cycle.LK application.

## Prerequisites

1. A Firebase project
2. Firebase project configuration keys
3. Firebase Admin SDK service account key

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Cloud Messaging

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Go to the **Cloud Messaging** tab
3. Note down your **Server Key** and **Sender ID**

## Step 3: Add Web App to Firebase

1. In Project Settings, go to **General** tab
2. Scroll down to "Your apps" section
3. Click **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Cycle.LK Web")
5. Copy the Firebase configuration object

## Step 4: Generate VAPID Key

1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. In the **Web configuration** section, click **Generate key pair**
3. Copy the VAPID key

## Step 5: Generate Service Account Key

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Place it in your backend directory as `config/firebase-service-account.json`

## Step 6: Configure Environment Variables

### Frontend (.env)

Create a `.env` file in your frontend-web directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### Backend (.env)

Add to your backend `.env` file:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_with_newlines"
```

## Step 7: Update Service Worker Configuration

1. Open `public/firebase-messaging-sw.js`
2. Replace the Firebase configuration with your actual values:

```javascript
firebase.initializeApp({
  apiKey: "your_actual_api_key",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
});
```

## Step 8: Test Notifications

1. Start your backend server: `npm run dev`
2. Start your frontend: `npm run dev`
3. Login to your application
4. Check browser console for "FCM Token registered successfully"
5. Use the test endpoint to send a notification:

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification",
    "type": "GENERAL"
  }'
```

## Notification Flow

### When a User Creates a Booking:

1. **User** creates booking request
2. **System** sends push notification to **Partner**
3. **Partner** receives notification: "New Booking Request!"

### When Partner Accepts Booking:

1. **Partner** accepts booking
2. **System** sends notification to **User**: "Booking Confirmed!"
3. **System** sends payment notification to **User**: "Payment Required"

### When Partner Rejects Booking:

1. **Partner** rejects booking
2. **System** sends notification to **User**: "Booking Declined"

## Troubleshooting

### Common Issues:

1. **"Permission denied"**: User hasn't granted notification permission
2. **"No FCM token"**: VAPID key might be incorrect
3. **"Firebase not initialized"**: Check environment variables
4. **Service worker not working**: Ensure SW file is in public directory

### Debug Steps:

1. Check browser console for Firebase errors
2. Verify environment variables are loaded
3. Test with Firebase Console (Messaging > Send test message)
4. Check network tab for failed API calls

## Browser Support

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Limited support (iOS 16.4+)
- **Edge**: Full support

## Security Notes

1. Never expose Firebase Admin SDK private key in frontend
2. Use environment variables for all sensitive keys
3. Validate FCM tokens on backend before storing
4. Implement rate limiting for notification endpoints

## Production Deployment

1. Update Firebase configuration for production domain
2. Add production domain to Firebase authorized domains
3. Use production environment variables
4. Test notification delivery in production environment

That's it! Your Firebase Cloud Messaging should now be set up and working for real-time booking notifications.
