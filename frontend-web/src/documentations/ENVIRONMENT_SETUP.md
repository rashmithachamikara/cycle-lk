# Environment Configuration Setup

## Overview

This document describes the environment configuration setup for the Cycle.LK frontend application.

## Files Created/Modified

### 1. `.env` - Main Environment File

- Contains all environment variables for the application
- **IMPORTANT**: This file is gitignored and should not be committed to version control
- Contains sensitive information like API keys and secrets

### 2. `.env.example` - Environment Template

- Template file showing all available environment variables
- Safe to commit to version control
- Developers should copy this to `.env` and fill in actual values

### 3. `src/utils/apiUtils.ts` - Enhanced API Utilities

- Centralized environment configuration through `ENV_CONFIG` object
- Enhanced axios instance with environment-based configuration
- Debug logging capabilities controlled by environment variables
- File upload validation utilities
- Environment-aware helper functions

## Environment Variables

### API Configuration

- `VITE_API_URL`: Backend API base URL (default: http://localhost:5000/api)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (default: 10000)

### Authentication & Security

- `VITE_JWT_SECRET_KEY`: JWT secret key for client-side validation
- `VITE_TOKEN_EXPIRY`: Token expiration time (default: 24h)

### Application Configuration

- `VITE_APP_NAME`: Application name (default: Cycle.LK)
- `VITE_APP_VERSION`: Application version (default: 1.0.0)
- `VITE_APP_ENVIRONMENT`: Environment mode (development/production)

### External Services (Future Use)

- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name

### Feature Flags

- `VITE_ENABLE_ANALYTICS`: Enable/disable analytics (default: false)
- `VITE_ENABLE_DEBUG_MODE`: Enable debug logging (default: true in development)
- `VITE_ENABLE_NOTIFICATIONS`: Enable notifications (default: true)

### Upload Configuration

- `VITE_MAX_FILE_SIZE`: Maximum file upload size in bytes (default: 5MB)
- `VITE_ALLOWED_FILE_TYPES`: Comma-separated list of allowed MIME types

## Usage Examples

### Basic API Call

```typescript
import { api, debugLog } from "../utils/apiUtils";

const fetchData = async () => {
  try {
    debugLog("Fetching data from API");
    const response = await api.get("/endpoint");
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

### Environment-Aware Code

```typescript
import { ENV_CONFIG, isDevelopment } from "../utils/apiUtils";

if (isDevelopment()) {
  console.log("Running in development mode");
}

console.log("App version:", ENV_CONFIG.APP_VERSION);
```

### File Upload Validation

```typescript
import { validateFileUpload } from "../utils/apiUtils";

const handleFileUpload = (file: File) => {
  const validation = validateFileUpload(file);
  if (!validation.isValid) {
    alert(validation.error);
    return;
  }
  // Proceed with upload
};
```

## Benefits

1. **Centralized Configuration**: All environment variables managed in one place
2. **Type Safety**: TypeScript interfaces for configuration objects
3. **Debug Control**: Environment-controlled debug logging
4. **Validation**: Built-in file upload and configuration validation
5. **Flexibility**: Easy to switch between environments
6. **Security**: Sensitive data kept in gitignored files
7. **Developer Experience**: Clear examples and documentation

## Development Workflow

1. Copy `.env.example` to `.env`
2. Fill in actual values for your environment
3. Start the development server
4. Use the centralized `api` instance from `apiUtils.ts` for all HTTP requests
5. Use `debugLog()` for development logging that can be toggled

## Production Deployment

For production deployment, ensure:

1. Set `VITE_APP_ENVIRONMENT=production`
2. Set `VITE_ENABLE_DEBUG_MODE=false`
3. Use production API URLs and keys
4. Verify all environment variables are properly set in the deployment environment
