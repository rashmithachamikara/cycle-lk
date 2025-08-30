import React from 'react';
import { Filter, X } from 'lucide-react';

interface BookingFilterProps {
  activeFilter: 'all' | 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  onFilterChange: (filter: 'all' | 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled') => void;
  bookingCounts: {
    all: number;
    requested: number;
    confirmed: number;
    active: number;
    completed: number;
    cancelled: number;
  };
}

const BookingFilter: React.FC<BookingFilterProps> = ({ 
  activeFilter, 
  onFilterChange, 
  bookingCounts 
}) => {
  const filters = [
    { id: 'all' as const, label: 'All Bookings', count: bookingCounts.all },
    { id: 'requested' as const, label: 'Requested', count: bookingCounts.requested },
    { id: 'confirmed' as const, label: 'Confirmed', count: bookingCounts.confirmed },
    { id: 'active' as const, label: 'Active', count: bookingCounts.active },
    { id: 'completed' as const, label: 'Completed', count: bookingCounts.completed },
    { id: 'cancelled' as const, label: 'Cancelled', count: bookingCounts.cancelled },
  ];

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <Filter className="h-4 w-4 text-gray-500 mr-2" />
        <span className="text-sm font-medium text-gray-700">Filter:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeFilter === filter.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }
            `}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className={`
                ml-2 px-1.5 py-0.5 text-xs rounded-full
                ${activeFilter === filter.id
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-700'
                }
              `}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {activeFilter !== 'all' && (
        <button
          onClick={() => onFilterChange('all')}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          title="Clear filter"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default BookingFilter;
