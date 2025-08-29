import { useState } from 'react';
import { BikeType } from '../../services/bikeService';

interface BikeFiltersProps {
  showFilters: boolean;
  onApplyFilters?: (filters?: {
    type?: BikeType;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price-asc' | 'price-desc' | 'rating';
  }) => Promise<void>;
}

const BikeFilters = ({ showFilters, onApplyFilters }: BikeFiltersProps) => {
  const [filters, setFilters] = useState({
    type: '' as string,
    priceRange: '' as string,
    sort: '' as string
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = async () => {
    if (!onApplyFilters) return;

    const filterData: {
      type?: BikeType;
      minPrice?: number;
      maxPrice?: number;
      sort?: 'price-asc' | 'price-desc' | 'rating';
    } = {};

    if (filters.type && filters.type !== 'all') {
      filterData.type = filters.type as BikeType;
    }

    if (filters.priceRange && filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filterData.minPrice = min;
      filterData.maxPrice = max;
    }

    if (filters.sort && filters.sort !== 'all') {
      filterData.sort = filters.sort as 'price-asc' | 'price-desc' | 'rating';
    }

    await onApplyFilters(filterData);
  };

  if (!showFilters) return null;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bike Type</label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="city">City</option>
            <option value="mountain">Mountain</option>
            <option value="road">Road</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
            <option value="touring">Touring</option>
            <option value="folding">Folding</option>
            <option value="cruiser">Cruiser</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (per day)</label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          >
            <option value="all">Any Price</option>
            <option value="500-1000">Rs.500-1000</option>
            <option value="1000-2000">Rs.1000-2000</option>
            <option value="2000-5000">Rs.2000-5000</option>
            <option value="5000-10000">Rs.5000+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="all">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default BikeFilters;
