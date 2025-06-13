import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Interface for partner registration data
export interface PartnerRegistrationData {
  userId: string;
  companyName: string;
  companyAddress: string;
  businessRegNumber: string;
  contactPhone: string;
}

// Interface for bank details
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchCode: string;
}

// Partner service object
export const partnerService = {
  // Register as a partner
  registerPartner: async (partnerData: PartnerRegistrationData) => {
    const response = await axios.post(`${API_URL}/partners`, partnerData);
    return response.data;
  },

  // Get all partners
  getAllPartners: async () => {
    const response = await axios.get(`${API_URL}/partners`);
    return response.data;
  },

  // Get a single partner by ID
  getPartnerById: async (id: string) => {
    const response = await axios.get(`${API_URL}/partners/${id}`);
    return response.data;
  },

  // Update partner verification status (requires admin role)
  updateVerificationStatus: async (id: string, status: string) => {
    const response = await axios.put(`${API_URL}/partners/${id}/verification`, { 
      verificationStatus: status 
    });
    return response.data;
  },

  // Update partner bank details (requires partner role)
  updateBankDetails: async (id: string, bankDetails: BankDetails) => {
    const response = await axios.put(`${API_URL}/partners/${id}/bank`, bankDetails);
    return response.data;
  },

  // Get partner bikes
  getPartnerBikes: async (id: string) => {
    const response = await axios.get(`${API_URL}/partners/${id}/bikes`);
    return response.data;
  }
};
