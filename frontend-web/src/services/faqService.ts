import { api, debugLog } from '../utils/apiUtils';

// Log service initialization in debug mode
debugLog('FAQ Service initialized');

// Interface for FAQ filter parameters
export interface FAQFilterParams {
  category?: string;
  active?: boolean;
}

// Interface for FAQ data
export interface FAQData {
  question: string;
  answer: string;
  category: string;
  active: boolean;
}

// FAQ service object
export const faqService = {
  // Get all FAQs with optional filters
  getAllFAQs: async (filters?: FAQFilterParams) => {
    debugLog('Fetching FAQs with filters', filters);
    const response = await api.get('/faqs', { params: filters });
    return response.data;
  },

  // Get FAQ by ID
  getFAQById: async (id: string) => {
    debugLog('Fetching FAQ by ID', { id });
    const response = await api.get(`/faqs/${id}`);
    return response.data;
  },

  // Create FAQ (requires admin role)
  createFAQ: async (faqData: FAQData) => {
    debugLog('Creating new FAQ', faqData);
    const response = await api.post('/faqs', faqData);
    return response.data;
  },

  // Update FAQ (requires admin role)
  updateFAQ: async (id: string, faqData: Partial<FAQData>) => {
    debugLog('Updating FAQ', { id, faqData });
    const response = await api.put(`/faqs/${id}`, faqData);
    return response.data;
  },

  // Update FAQ order (requires admin role)
  updateFAQOrder: async (id: string, newOrder: number) => {
    debugLog('Updating FAQ order', { id, newOrder });
    const response = await api.put(`/faqs/${id}/order`, { newOrder });
    return response.data;
  },

  // Delete FAQ (requires admin role)
  deleteFAQ: async (id: string) => {
    debugLog('Deleting FAQ', { id });
    const response = await api.delete(`/faqs/${id}`);
    return response.data;
  },

  // Get FAQ categories
  getFAQCategories: async () => {
    debugLog('Fetching FAQ categories');
    const response = await api.get('/faqs/categories/list');
    return response.data;
  }
};
