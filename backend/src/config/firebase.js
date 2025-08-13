const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// and place it in your backend directory or use environment variables
const initializeFirebase = () => {
  try {
    // Option 1: Using service account key file (recommended for development)
    const serviceAccount = require('../config/firebase-service-account.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log('Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    // Option 2: Using environment variables (recommended for production)
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      console.log('Firebase Admin initialized with environment variables');
      return admin;
    } catch (envError) {
      console.error('Firebase Admin initialization failed:', envError);
      return null;
    }
  }
};

const firebaseAdmin = initializeFirebase();

module.exports = firebaseAdmin;
