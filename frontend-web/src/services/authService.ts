import api from '../utils/apiUtils';

// User registration data interface
export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

// User profile update data interface
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  [key: string]: string | undefined;
}

// Auth service
export const authService = {
  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  // Register user
  register: async (userData: RegisterUserData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    const response = await api.get(`/users/${userData.id}`);
    return response.data;
  }
};

// User service
export const userService = {
  // Update user profile
  updateProfile: async (userId: string, userData: UpdateProfileData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  // Change user password
  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const response = await api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  },
  
  // Get user by ID
  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
};

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};
