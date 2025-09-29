import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import services and interfaces
import { locationService, Location } from '../services/locationService';
import { bikeService, BikeFilterParams, Bike } from '../services/bikeService';

// Import components
import {
  LocationHero,
  BikeFilters,
  BikeSection
} from '../components/LocationPage';

const LocationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [location, setLocation] = useState<Location | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch location details
  const fetchLocation = useCallback(async () => {
    if (!id) {
      navigate('/locations');
      return;
    }
    
    try {
      setLocationLoading(true);
      const locationData = await locationService.getLocationById(id);
      console.log('Location data received:', locationData); // Temporary debug log
      setLocation(locationData);
    } catch (err) {
      console.error('Error fetching location:', err);
      setError('Failed to load location details. Please try again later.');
    } finally {
      setLocationLoading(false);
    }
  }, [id, navigate]);

  // Fetch bikes for this location
  const fetchBikes = useCallback(async (filters?: BikeFilterParams) => {
    if (!location?.name) return;
    
    try {
      setLoading(true);
      const filtersWithLocation = {
        ...filters,
        location: location.name // Use location name for filtering
      };
      const bikesData = await bikeService.getAllBikes(filtersWithLocation);
      console.log(`Bikes in location ${location.name}:`, bikesData); // Temporary debug log
      setBikes(bikesData);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
      console.error('Error fetching bikes:', err);
    } finally {
      setLoading(false);
    }
  }, [location?.name]);

  // Load initial data
  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchLocation();
    } else {
      navigate('/locations');
    }
  }, [id, navigate, fetchLocation]);

  // Load bikes when location is available
  useEffect(() => {
    if (location) {
      fetchBikes();
    }
  }, [location, fetchBikes]);

  // Apply filters when search parameters change
  useEffect(() => {
    const filters: BikeFilterParams = {};
    
    if (selectedType !== 'all') {
      filters.type = selectedType;
    }
    
    // Map the sort options to API parameters
    switch (sortBy) {
      case 'price-low':
        filters.sort = 'price-asc';
        break;
      case 'price-high':
        filters.sort = 'price-desc';
        break;
      case 'rating':
        filters.sort = 'rating';
        break;
    }
    
    fetchBikes(filters);
  }, [selectedType, sortBy, fetchBikes]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchBikes({
          type: selectedType !== 'all' ? selectedType : undefined
        });
      } else {
        fetchBikes({
          type: selectedType !== 'all' ? selectedType : undefined
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, fetchBikes]);

  // Filter bikes based on search query client-side
  const filteredBikes = bikes.filter(bike => {
    return searchQuery === '' || 
           bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           bike.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
           bike.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSelectedType('all');
    setSearchQuery('');
    setSortBy('rating');
    fetchBikes();
  }, [fetchBikes]);

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20 mt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading location details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20 mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Location not found</h2>
            <p className="text-gray-600 mb-4">The location you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/locations')}
              className="bg-emerald-500 text-white/80 px-6 py-3 rounded-lg hover:text-white transition-colors"
            >
              Back to Locations
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Location Hero Section */}
      <LocationHero location={location} bikeCount={filteredBikes.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <div className="mb-8">
          <BikeFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            totalBikes={filteredBikes.length}
          />
        </div>

        {/* Bikes Section */}
        <BikeSection
          bikes={filteredBikes}
          viewMode={viewMode as 'grid' | 'list'}
          loading={loading}
          error={error}
          onRetry={() => {
            setError(null);
            fetchBikes();
          }}
          onClearFilters={handleClearFilters}
        />
      </div>

      <Footer />
    </div>
  );
};

export default LocationPage;