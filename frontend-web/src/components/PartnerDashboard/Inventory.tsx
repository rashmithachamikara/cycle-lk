//frontend-web/src/components/PartnerDashboard/Inventory.tsx
import { Link } from 'react-router-dom';
import { Search, PlusCircle, X, AlertTriangle, RefreshCw, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Bike } from '../../services/bikeService';
import { useState } from 'react';

interface InventoryProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  bikeToDelete: {id: string, name: string} | null;
  setBikeToDelete: (bike: {id: string, name: string} | null) => void;
  handleConfirmDelete: () => void;
  isDeleting: boolean;
  deleteSuccess: boolean;
  Bikes: Bike[];
  updateBikeAvailability: (bikeId: string, status: string, reason?: string, unavailableDates?: string[]) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const Inventory = ({
  showDeleteModal,
  setShowDeleteModal,
  bikeToDelete,
  setBikeToDelete,
  handleConfirmDelete,
  isDeleting,
  deleteSuccess,
  Bikes,
  updateBikeAvailability,
  onRefresh
}: InventoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter bikes based on search term
  const filteredBikes = Bikes.filter(bike =>
    bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bike.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bike.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const toggleAvailability = async (bike: Bike) => {
    const newStatus = bike.availability?.status === 'available' ? 'unavailable' : 'available';
    const reason = newStatus === 'unavailable' ? 'Temporarily unavailable' : '';
    await updateBikeAvailability(bike.id, newStatus, reason);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between mb-6">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/partner-dashboard/add-bike" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Bike
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bike ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bike Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBikes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No bikes found matching your search.' : 'No bikes found. Add your first bike to get started.'}
                  </td>
                </tr>
              ) : (
                filteredBikes.map((bike: Bike) => (
                  <tr key={bike.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bike.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {bike.images && bike.images.length > 0 && (
                          <img 
                            src={bike.images[0].url} 
                            alt={bike.name} 
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bike.name}</div>
                          <div className="text-sm text-gray-500">${bike.pricing.perDay}/day</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {bike.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize" 
                         title={bike.location + 
                           (typeof bike.currentPartnerId === 'object' && bike.currentPartnerId?.companyName 
                             ? " - " + bike.currentPartnerId.companyName 
                             : "")}>
                      {bike.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bike.availability?.status)}`}>
                          {bike.availability?.status || 'Unknown'}
                        </span>
                        <button
                          onClick={() => toggleAvailability(bike)}
                          className="text-gray-400 hover:text-gray-600"
                          title={`Toggle to ${bike.availability?.status === 'available' ? 'unavailable' : 'available'}`}
                        >
                          {bike.availability?.status === 'available' ? (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`${getConditionColor(bike.condition)} font-medium`}>
                        {bike.condition || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/edit-bike/${bike.id}`} 
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Edit bike"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900 flex items-center"
                          onClick={() => {
                            setBikeToDelete({ id: bike.id, name: bike.name });
                            setShowDeleteModal(true);
                          }}
                          title="Delete bike"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bikeToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 text-sm">
                Are you sure you want to delete the bike <span className="font-semibold">{bikeToDelete.name}</span>?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v5l4.5-4.5A8 8 0 0116 20v-5l-4.5 4.5A8 8 0 018 4v5L3.5 4.5A8 8 0 004 12z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Confirm Delete
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            {deleteSuccess && (
              <div className="mt-4 text-center">
                <p className="text-sm text-green-600">
                  Bike deleted successfully!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Inventory;