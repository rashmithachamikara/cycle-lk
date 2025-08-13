const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  // Skip Firebase initialization if no credentials are provided
//   if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'cycle-lk-8e21b') {
//     console.log('⚠️  Firebase Admin SDK not initialized - Missing or invalid credentials');
//     console.log('   Real-time features and push notifications will be disabled');
//     console.log('   To enable Firebase, please set up proper service account credentials');
//     return null;
//   }

  try {
    // Option 1: Using service account key file (recommended for development)
    try {
      const serviceAccount = require('./cycle-lk-8e21b-firebase-adminsdk-fbsvc-f6174ba518.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      console.log('✅ Firebase Admin initialized successfully with service account file');
      return admin;
    } catch (fileError) {
      console.log('Service account file not found, trying environment variables...');
      
      // Option 2: Using environment variables (recommended for production)
      if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Firebase environment variables not configured');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      console.log('✅ Firebase Admin initialized successfully with environment variables');
      return admin;
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.log('   Real-time features and push notifications will be disabled');
    console.log('   Please check your Firebase configuration');
    return null;
  }
};

const firebaseAdmin = initializeFirebase();

module.exports = firebaseAdmin;
