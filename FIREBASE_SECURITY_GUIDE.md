# Firebase Setup Guide - Security Best Practices

## ⚠️ IMPORTANT: Never commit Firebase service account JSON files to Git!

### Setting up Firebase Authentication

1. **Get your Firebase service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`cycle-lk-8e21b`)
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Extract credentials from the JSON file:**
   Open the downloaded JSON file and extract these values:
   ```json
   {
     "project_id": "cycle-lk-8e21b",
     "client_email": "firebase-adminsdk-xxxxx@cycle-lk-8e21b.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
   }
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `backend` directory with:
   ```env
   FIREBASE_PROJECT_ID=cycle-lk-8e21b
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cycle-lk-8e21b.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
   ```

4. **NEVER commit the JSON file:**
   - The `.gitignore` file is configured to exclude all Firebase service account files
   - Always use environment variables for credentials
   - For production deployment, set these as environment variables in your hosting platform

### Security Checklist

- ✅ JSON service account file is in `.gitignore`
- ✅ Credentials are stored in environment variables
- ✅ `.env` file is in `.gitignore`
- ✅ Only environment variables are used in code
- ❌ NEVER commit `.env` files or JSON credentials

### If you accidentally commit secrets:

1. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/secret/file.json' --prune-empty --tag-name-filter cat -- --all
   ```

2. **Force push the cleaned history:**
   ```bash
   git push origin branch-name --force
   ```

3. **Regenerate the compromised credentials** in Firebase Console

### Production Deployment

For production environments (Heroku, Vercel, etc.), set these environment variables in your hosting platform's dashboard:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`  
- `FIREBASE_PRIVATE_KEY`
