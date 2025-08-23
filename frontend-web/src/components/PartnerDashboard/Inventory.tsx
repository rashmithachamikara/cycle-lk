//frontend-web/src/components/PartnerDashboard/Inventory.tsx
import { Link } from 'react-router-dom';
import { Search, PlusCircle, X, AlertTriangle } from 'lucide-react';
import { Bike,transformBike } from '../../services/bikeService';
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
}

const Inventory = ({
  showDeleteModal,
  setShowDeleteModal,
  bikeToDelete,
  setBikeToDelete,
  handleConfirmDelete,
  isDeleting,
  deleteSuccess,
  Bikes
}: InventoryProps) => {
  // const inventoryItems = [
  //   { id: 'BIKE-1234', name: 'City Cruiser', type: 'City', status: 'rented', condition: 'Excellent' },
  //   { id: 'BIKE-2345', name: 'Mountain Explorer', type: 'Mountain', status: 'rented', condition: 'Good' },
  //   { id: 'BIKE-3456', name: 'Beach Rider', type: 'Cruiser', status: 'available', condition: 'Excellent' },
  //   { id: 'BIKE-4567', name: 'City Cruiser', type: 'City', status: 'maintenance', condition: 'Fair' },
  //   { id: 'BIKE-5678', name: 'Mountain Explorer', type: 'Mountain', status: 'available', condition: 'Excellent' }
  // ];
  const [inventoryItems] = useState<Bike[]>(transformBike(Bikes)));

  return (
    <>
      <div>
        <div className="flex justify-between mb-6">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <Link to="/partner-dashboard/add-bike" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Bike
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bike ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {inventoryItems.map((item:Bike) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.availability === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : item.availability === 'active' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.availability.charAt(0).toUpperCase() + item.availability.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.condition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/edit-bike/${item.id}`} className="text-blue-600 hover:text-blue-900 mr-4">Edit</Link>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        setBikeToDelete({ id: item.id, name: item.name });
                        setShowDeleteModal(true);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
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