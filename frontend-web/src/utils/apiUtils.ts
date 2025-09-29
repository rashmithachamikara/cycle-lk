import axios from 'axios';

// Environment variables configuration
export const ENV_CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:50001/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  JWT_SECRET_KEY: import.meta.env.VITE_JWT_SECRET_KEY || 'default_secret',
  TOKEN_EXPIRY: import.meta.env.VITE_TOKEN_EXPIRY || '24h',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Cycle.LK',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'),
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'],
};

// Set up base URL from environment variable
export const API_URL = ENV_CONFIG.API_URL;

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Initialize auth header from localStorage
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-auth-token'] = token;
}

// Create axios instance with default config
export const api = axios.create({
  baseURL: ENV_CONFIG.API_URL,
  timeout: ENV_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if token exists before each request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    // Add debug logging if enabled
    if (ENV_CONFIG.ENABLE_DEBUG_MODE) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    if (ENV_CONFIG.ENABLE_DEBUG_MODE) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Add debug logging if enabled
    if (ENV_CONFIG.ENABLE_DEBUG_MODE) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Add debug logging if enabled
    if (ENV_CONFIG.ENABLE_DEBUG_MODE) {
      console.error('[API Response Error]', error);
    }
    
    // Handle common errors
    if (error.response) {
      // Server responded with a status outside 2xx range
      if (error.response.status === 401) {
        // Check if the error is due to a missing or invalid token
        const errorMessage = error.response.data?.message || '';
        
        // Only clear authentication if it's a token-related error
        if (errorMessage.includes('No token') || 
            errorMessage.includes('Token is not valid') || 
            errorMessage.includes('authorization denied')) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Format error message from server
      const errorMessage = error.response.data?.message || 'Something went wrong';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something went wrong with setting up the request
      return Promise.reject(error);
    }
  }
);

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return ENV_CONFIG.APP_ENVIRONMENT === 'development';
};

/**
 * Check if the app is running in production mode
 */
export const isProduction = (): boolean => {
  return ENV_CONFIG.APP_ENVIRONMENT === 'production';
};

/**
 * Get the app version
 */
export const getAppVersion = (): string => {
  return ENV_CONFIG.APP_VERSION;
};

/**
 * Validate file upload constraints
 */
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > ENV_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${(ENV_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  
  // Check file type
  if (!ENV_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${ENV_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }
  
  return { isValid: true };
};

/**
 * Log debug information (only in development)
 */
export const debugLog = (message: string, data?: unknown): void => {
  if (ENV_CONFIG.ENABLE_DEBUG_MODE) {
    console.log(`[${ENV_CONFIG.APP_NAME}] ${message}`, data || '');
  }
};

/**
 * Get environment-specific configuration
 */
export const getConfig = () => ENV_CONFIG;

export default api;
