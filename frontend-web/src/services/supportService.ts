import { api, debugLog } from '../utils/apiUtils';

// Log service initialization in debug mode
debugLog('Support Service initialized');

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
    debugLog('Fetching all support tickets', filters);
    const response = await api.get('/support', { params: filters });
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id: string) => {
    debugLog('Fetching support ticket by ID', { id });
    const response = await api.get(`/support/${id}`);
    return response.data;
  },

  // Get user tickets
  getUserTickets: async (userId: string, status?: string) => {
    debugLog('Fetching user support tickets', { userId, status });
    const response = await api.get(`/support/user/${userId}`, {
      params: { status }
    });
    return response.data;
  },

  // Create support ticket
  createTicket: async (ticketData: TicketData) => {
    debugLog('Creating support ticket', ticketData);
    const response = await api.post('/support', ticketData);
    return response.data;
  },

  // Update ticket status (requires admin role)
  updateTicketStatus: async (id: string, status: string) => {
    debugLog('Updating ticket status', { id, status });
    const response = await api.put(`/support/${id}/status`, { status });
    return response.data;
  },

  // Assign ticket (requires admin role)
  assignTicket: async (id: string, adminId: string) => {
    debugLog('Assigning ticket', { id, adminId });
    const response = await api.put(`/support/${id}/assign`, { adminId });
    return response.data;
  }
};
