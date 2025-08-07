//frontend-web/src/services/authService.ts
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

// Document verification interfaces
export interface IdDocumentData {
  documentType: 'national_id' | 'passport' | 'driving_license' | 'other';
  documentNumber: string;
  documentImage: File;
}

export interface IdDocumentStatus {
  isVerified: boolean;
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  documentType?: string;
  documentNumber?: string;
  documentImage?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
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
    const response = await api.post('/users', userData);
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
  },
  
  // Submit ID document for verification
  submitIdDocument: async (userId: string, documentData: IdDocumentData) => {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('documentType', documentData.documentType);
    formData.append('documentNumber', documentData.documentNumber);
    formData.append('documentImage', documentData.documentImage);
    
    const response = await api.post(`/users/${userId}/verification/document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Get ID document verification status
  getIdDocumentStatus: async (userId: string) => {
    const response = await api.get(`/users/${userId}/verification/document/status`);
    return response.data;
  },
  
  // Admin only: Approve ID document verification
  approveIdDocument: async (userId: string) => {
    const response = await api.put(`/users/${userId}/verification/document/approve`);
    return response.data;
  },
  
  // Admin only: Reject ID document verification
  rejectIdDocument: async (userId: string, rejectionReason: string) => {
    const response = await api.put(`/users/${userId}/verification/document/reject`, {
      rejectionReason
    });
    return response.data;
  },
  
  // Admin only: Get all pending ID document verifications
  getPendingVerifications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/admin/verifications/pending', {
      params: { page, limit }
    });
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
