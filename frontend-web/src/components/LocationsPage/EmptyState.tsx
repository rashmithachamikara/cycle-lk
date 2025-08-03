import React from 'react';
import { Bike, MapIcon } from 'lucide-react';

interface EmptyStateProps {
  type: 'locations' | 'bikes';
  onClearFilters?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onClearFilters }) => {
  if (type === 'locations') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations available</h3>
        <p className="text-gray-600">We're currently expanding our network. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes found</h3>
      <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
