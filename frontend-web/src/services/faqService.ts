import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

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
    const response = await axios.get(`${API_URL}/faqs`, { params: filters });
    return response.data;
  },

  // Get FAQ by ID
  getFAQById: async (id: string) => {
    const response = await axios.get(`${API_URL}/faqs/${id}`);
    return response.data;
  },

  // Create FAQ (requires admin role)
  createFAQ: async (faqData: FAQData) => {
    const response = await axios.post(`${API_URL}/faqs`, faqData);
    return response.data;
  },

  // Update FAQ (requires admin role)
  updateFAQ: async (id: string, faqData: Partial<FAQData>) => {
    const response = await axios.put(`${API_URL}/faqs/${id}`, faqData);
    return response.data;
  },

  // Update FAQ order (requires admin role)
  updateFAQOrder: async (id: string, newOrder: number) => {
    const response = await axios.put(`${API_URL}/faqs/${id}/order`, { newOrder });
    return response.data;
  },

  // Delete FAQ (requires admin role)
  deleteFAQ: async (id: string) => {
    const response = await axios.delete(`${API_URL}/faqs/${id}`);
    return response.data;
  },

  // Get FAQ categories
  getFAQCategories: async () => {
    const response = await axios.get(`${API_URL}/faqs/categories/list`);
    return response.data;
  }
};
