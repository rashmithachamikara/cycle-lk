import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ChatMessage {
  messageId?: string;
  type?: 'user' | 'bot';
  content?: string;
  message?: string;
  timestamp?: string | Date;
  intent?: string;
  suggestions?: string[];
  actions?: any[];
  data?: any;
  needsHumanSupport?: boolean;
}

interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
  fallbackResponse?: any;
}

interface ChatHistory {
  success: boolean;
  history?: ChatMessage[];
  error?: string;
}

interface Feedback {
  helpful?: boolean;
  rating?: number;
  comment?: string;
}

class ChatbotService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/chat`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds for AI responses
    });

    // Add request interceptor to include auth token if available
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          config.headers['x-auth-token'] = token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Chatbot API error:', error);
        
        if (error.response?.status === 429) {
          // Rate limit exceeded
          throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
          // Server error
          throw new Error('Chatbot service is temporarily unavailable. Please try again.');
        } else if (error.code === 'ECONNABORTED') {
          // Timeout
          throw new Error('Request timed out. Please try again.');
        }
        
        throw error;
      }
    );
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(message: string, sessionId: string | null = null): Promise<ChatResponse> {
    try {
      const response = await this.apiClient.post('/message', {
        message: message.trim(),
        sessionId
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      return {
        success: false,
        error: errorMessage,
        fallbackResponse: this.getFallbackResponse()
      };
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(sessionId: string | null = null, limit: number = 20): Promise<ChatHistory> {
    try {
      const endpoint = sessionId ? `/history/${sessionId}` : '/history';
      const response = await this.apiClient.get(endpoint, {
        params: { limit }
      });

      return {
        success: true,
        history: response.data.data.history
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chat history';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update message feedback
   */
  async updateMessageFeedback(sessionId: string, messageId: string, feedback: Feedback): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiClient.post(`/feedback/${sessionId}/${messageId}`, feedback);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update feedback';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get suggested questions
   */
  async getSuggestions(category: string = 'general', limit: number = 5): Promise<{ success: boolean; suggestions: string[]; error?: string }> {
    try {
      const response = await this.apiClient.get('/suggestions', {
        params: { category, limit }
      });

      return {
        success: true,
        suggestions: response.data.data.suggestions
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suggestions';
      return {
        success: false,
        error: errorMessage,
        suggestions: this.getDefaultSuggestions()
      };
    }
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(sessionId: string | null = null): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoint = sessionId ? `/history/${sessionId}` : '/history';
      await this.apiClient.delete(endpoint);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear chat history';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get chatbot status
   */
  async getChatbotStatus(): Promise<{ success: boolean; status: { online: boolean }; error?: string }> {
    try {
      const response = await this.apiClient.get('/status');
      return {
        success: true,
        status: response.data.data
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get chatbot status';
      return {
        success: false,
        error: errorMessage,
        status: { online: false }
      };
    }
  }

  /**
   * Get chatbot capabilities
   */
  async getChatbotCapabilities(): Promise<{ success: boolean; capabilities?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.apiClient.get('/capabilities');
      return {
        success: true,
        capabilities: response.data.data
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get capabilities';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get fallback response when service is unavailable
   * @returns {Object} Fallback response
   */
  getFallbackResponse() {
    return {
      message: "I'm currently experiencing technical difficulties. Please try again later or contact our support team for assistance.",
      suggestions: [
        'Try again',
        'Contact support',
        'Browse bikes',
        'Check locations'
      ],
      needsHumanSupport: true
    };
  }

  /**
   * Get default suggestions when API fails
   * @returns {Array<string>} Default suggestions
   */
  getDefaultSuggestions() {
    return [
      'Check availability',
      'View locations',
      'How to book?',
      'Contact support'
    ];
  }

  /**
   * Format message for display
   */
  formatMessage(message: ChatMessage): ChatMessage {
    return {
      messageId: message.messageId || Date.now().toString(),
      type: message.type || 'bot',
      content: message.content || message.message || '',
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      intent: message.intent,
      suggestions: message.suggestions || [],
      actions: message.actions || [],
      data: message.data,
      needsHumanSupport: message.needsHumanSupport || false
    };
  }

  /**
   * Generate session ID for guest users
   */
  generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save session ID to local storage
   */
  saveSessionId(sessionId: string): void {
    try {
      localStorage.setItem('chatbot_session_id', sessionId);
    } catch (error) {
      console.warn('Failed to save session ID to localStorage:', error);
    }
  }

  /**
   * Get saved session ID from local storage
   */
  getSavedSessionId(): string | null {
    try {
      return localStorage.getItem('chatbot_session_id');
    } catch (error) {
      console.warn('Failed to get session ID from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved session ID
   */
  clearSavedSessionId(): void {
    try {
      localStorage.removeItem('chatbot_session_id');
    } catch (error) {
      console.warn('Failed to clear session ID from localStorage:', error);
    }
  }
}

// Export singleton instance
export default new ChatbotService();