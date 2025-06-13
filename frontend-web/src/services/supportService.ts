import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Interface for support ticket filter parameters
export interface TicketFilterParams {
  userId?: string;
  category?: string;
  status?: string;
  priority?: string;
}

// Interface for support ticket data
export interface TicketData {
  subject: string;
  category: string;
  message: string;
  priority?: string;
}

// Support service object
export const supportService = {
  // Get all support tickets (requires admin role)
  getAllTickets: async (filters?: TicketFilterParams) => {
    const response = await axios.get(`${API_URL}/support`, { params: filters });
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id: string) => {
    const response = await axios.get(`${API_URL}/support/${id}`);
    return response.data;
  },

  // Get user tickets
  getUserTickets: async (userId: string, status?: string) => {
    const response = await axios.get(`${API_URL}/support/user/${userId}`, {
      params: { status }
    });
    return response.data;
  },

  // Create support ticket
  createTicket: async (ticketData: TicketData) => {
    const response = await axios.post(`${API_URL}/support`, ticketData);
    return response.data;
  },

  // Update ticket status (requires admin role)
  updateTicketStatus: async (id: string, status: string) => {
    const response = await axios.put(`${API_URL}/support/${id}/status`, { status });
    return response.data;
  },

  // Assign ticket (requires admin role)
  assignTicket: async (id: string, adminId: string) => {
    const response = await axios.put(`${API_URL}/support/${id}/assign`, { adminId });
    return response.data;
  }
};
