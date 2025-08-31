import { useNavigate } from 'react-router-dom';
import { Partner } from '../../services/partnerService';
import {
  Search,
  Plus,
  Loader,
  AlertCircle,
  MapPin,
  User,
  Bike,
  CheckCircle,
  NotebookPen,
  Star
} from 'lucide-react';

interface PartnersTabProps {
  partners: Partner[];
  isLoadingPartners: boolean;
  partnersError: string | null;
  approvingPartners: Set<string>;
  onApprovePartner: (partnerId: string) => void;
  onRejectPartner: (partnerId: string) => void;
}

const PartnersTab: React.FC<PartnersTabProps> = ({
  partners,
  isLoadingPartners,
  partnersError,
  approvingPartners,
  onApprovePartner,
  onRejectPartner
}) => {
  const navigate = useNavigate();

  const pendingPartners = partners.filter(partner => partner.status === 'pending');
  const activePartners = partners.filter(partner => partner.status === 'active');

  const getPartnerLocation = (partner: Partner): string => {
    if (typeof partner.location === 'object' && partner.location?.name) {
      return partner.location.name;
    }
    return partner.address || partner.location as string || 'Location not specified';
  };

  const getContactPerson = (partner: Partner): string => {
    return partner.contactPerson || 'Not specified';
  };

  const getPartnerPhone = (partner: Partner): string => {
    return partner.phone || 'Not provided';
  };

  const getPartnerEmail = (partner: Partner): string => {
    return partner.email || 'Not provided';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Partner Management Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partner Management</h2>
          <p className="text-gray-600">Manage all registered bike rental partners</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute left-3 top-2.5">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Partner Approval Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6" id="partner-section">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Approval Requests</h3>
        
        {isLoadingPartners ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading partners...</span>
          </div>
        ) : partnersError ? (
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            {partnersError}
          </div>
        ) : pendingPartners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No pending partner requests</div>
        ) : (
          <div className="space-y-6">
            {pendingPartners.map((partner) => (
              <div key={partner._id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-lg font-semibold text-gray-900">{partner.companyName}</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Pending Approval
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{getPartnerLocation(partner)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-2" />
                        <span>Contact: {getContactPerson(partner)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Bike className="h-4 w-4 mr-2" />
                        <span>Bikes to list: {partner.bikeCount || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => onApprovePartner(partner._id)}
                        disabled={approvingPartners.has(partner._id)}
                        className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvingPartners.has(partner._id) ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {approvingPartners.has(partner._id) ? 'Approving...' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => onRejectPartner(partner._id)}
                        disabled={approvingPartners.has(partner._id)}
                        className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/partners/${partner._id}/review`)}
                        className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-purple-500 transition-colors"
                      >
                        <NotebookPen className="h-4 w-4 mr-2" />
                        Review Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium">{partner._id.slice(-8)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-sm">{getPartnerEmail(partner)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{getPartnerPhone(partner)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-medium">{formatDate(partner.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Partners Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Partners</h3>
        
        {isLoadingPartners ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading partners...</span>
          </div>
        ) : activePartners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No active partners found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bikes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activePartners.map((partner) => (
                  <tr key={partner._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                      <div className="text-sm text-gray-500">{getContactPerson(partner)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPartnerLocation(partner)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.bikeCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        partner.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {partner.status?.charAt(0).toUpperCase() + partner.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-500">
                          {partner.rating ? partner.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        partner.verified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {partner.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/admin/partners/${partner._id}/review`)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Suspend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersTab;
