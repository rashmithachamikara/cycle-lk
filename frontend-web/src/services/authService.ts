import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Set up default headers
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Check for token and set auth header
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-auth-token'] = token;
}

// Auth service
export const authService = {
  // Login user
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/users/login`, { email, password });
    return response.data;
  },

  // Register user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    const response = await axios.post(`${API_URL}/users/`, userData);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    const response = await axios.get(`${API_URL}/users/${userData.id}`);
    return response.data;
  }
};

// User service
export const userService = {
  // Update user profile
  updateProfile: async (userId: string, userData: any) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  },

  // Change password
  changePassword: async (userId: string, data: { currentPassword: string; newPassword: string }) => {
    const response = await axios.put(`${API_URL}/users/${userId}/password`, data);
    return response.data;
  }
};

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};
