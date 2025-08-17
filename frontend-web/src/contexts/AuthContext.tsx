// frontend-web/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, setAuthToken } from '../services/authService';
import { notificationIntegrationService } from '../services/notificationIntegrationService';

// Define types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Set auth token using helper
          setAuthToken(storedToken);
          
          // Parse and set user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          
          console.log('Authentication restored from localStorage:', { userId: userData.id, role: userData.role });
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setAuthToken(null);
        }
      } else {
        console.log('No stored authentication found');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Initialize FCM and notification integration when user is authenticated
  useEffect(() => {
    const initializeNotifications = async () => {
      if (user && token) {
        try {
          // Initialize notification integration service
          await notificationIntegrationService.initialize(
            user.id, 
            user.role as 'user' | 'partner' | 'admin'
          );
          
          console.log('Notification integration initialized successfully');
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    };

    initializeNotifications();
  }, [user, token]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { token, user } = await authService.login(email, password);
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set in state
      setToken(token);
      setUser(user);
      
      // Set auth token using helper
      setAuthToken(token);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const { token, user } = await authService.register(userData);
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set in state
      setToken(token);
      setUser(user);
      
      // Set auth token using helper
      setAuthToken(token);
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const error = err as { response?: { data?: { message?: string, errors?: Array<{ message: string }> } } };
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Cleanup notification integration
    notificationIntegrationService.cleanup();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context values
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
