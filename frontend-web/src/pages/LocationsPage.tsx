import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import services and interfaces
import { locationService, Location } from '../services/locationService';
import { bikeService, BikeFilterParams, Bike } from '../services/bikeService';

// Import UI components
import { SearchAndFilters, BikeGrid } from '../ui';

// Import components
import {
  LocationCard,
  LoadingState,
  ErrorState,
  EmptyState,
  HeroSection
} from '../components/LocationsPage';

const LocationsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  
  // Updated state for API data
  const [locations, setLocations] = useState<Location[]>([]);
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations from API - using the enhanced locationService
  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      const data = await locationService.getAllLocations();
      setLocations(data);
      
      // Separately fetch popular locations using the new service method
      const popularData = await locationService.getPopularLocations();
      setPopularLocations(popularData);
    } catch (err) {
      setError('Failed to load locations. Please try again later.');
      console.error('Error fetching locations:', err);
    } finally {
      setLocationsLoading(false);
    }
  };

  // Fetch bikes with optional filters
  const fetchBikes = async (filters?: BikeFilterParams) => {
    try {
      const data = await bikeService.getAllBikes(filters);
      console.log('Bikes data received:', data); // Temporary debug log
      setBikes(data);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
      console.error('Error fetching bikes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchLocations();
      await fetchBikes();
    };
    
    loadInitialData();
  }, []);

  // Apply filters when search parameters change
  useEffect(() => {
    const filters: BikeFilterParams = {};
    
    if (selectedLocation !== 'all') {
      filters.location = selectedLocation;
    }
    
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
    
    setLoading(true);
    fetchBikes(filters);
  }, [selectedLocation, selectedType, sortBy]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        setLoading(true);
        fetchBikes({ 
          location: selectedLocation !== 'all' ? selectedLocation : undefined,
          type: selectedType !== 'all' ? selectedType : undefined 
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedLocation, selectedType]);

  // Filter bikes based on search query and availability
  const filteredBikes = bikes.filter(bike => {
    // Only show available bikes
    if (!bike.availability?.status) {
      return false;
    }
    
    // Apply search filter client-side, other filters are handled by the API
    return searchQuery === '' || 
           bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           bike.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handler for location card click
  const handleLocationSelect = (locationId: string) => {
    // Find the location by ID and use its name for filtering
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location.name);
      // Scroll to the bike listings section
      document.getElementById('bike-listings')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Navigate to location detail page
  const goToLocationDetail = (id: string) => {
    navigate(`/location/${id}`);
  };

  // No need for sortedBikes array since sorting is done by the API
  const sortedBikes = filteredBikes;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Location Cards */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <Link to="/locations" className="text-emerald-600 hover:text-emerald-700 font-medium">
              View All Destinations
            </Link>
          </div>
          
          {locationsLoading ? (
            <LoadingState message="Loading locations..." />
          ) : error ? (
            <ErrorState 
              error={error}
              onRetry={() => {
                setError(null);
                fetchLocations();
              }}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(popularLocations.length > 0 ? popularLocations : locations.slice(0, 6)).map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onViewBikes={handleLocationSelect}
                  onMoreDetails={goToLocationDetail}
                />
              ))}
            </div>
          )}
          
          {!locationsLoading && !error && locations.length === 0 && (
            <EmptyState type="locations" />
          )}
        </section>

        {/* Location Filter - separate from SearchAndFilters for specific location functionality */}
        {locations.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by location:</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
              {selectedLocation !== 'all' && (
                <button
                  onClick={() => setSelectedLocation('all')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search bikes or locations..."
          filterOptions={[
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'mountain', label: 'Mountain' },
            { value: 'beach', label: 'Beach Cruiser' },
            { value: 'city', label: 'City Bike' },
            { value: 'touring', label: 'Touring' }
          ]}
          filterValue={selectedType}
          onFilterChange={setSelectedType}
          filterLabel="All Types"
          sortOptions={[
            { value: 'rating', label: 'Sort by Rating' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'name', label: 'Name A-Z' }
          ]}
          sortValue={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          totalResults={bikes.length}
          filteredResults={sortedBikes.length}
          resultsLabel="bikes"
          className="mb-6"
        />

        {/* Bike Listings */}
        <section id="bike-listings">
          {loading ? (
            <LoadingState message="Loading bikes..." />
          ) : error ? (
            <ErrorState 
              error={error}
              onRetry={() => {
                setError(null);
                fetchBikes();
              }}
            />
          ) : (
            <BikeGrid bikes={sortedBikes} viewMode={viewMode as 'grid' | 'list'} />
          )}

          {!loading && sortedBikes.length === 0 && (
            <EmptyState 
              type="bikes" 
              onClearFilters={() => {
                setSelectedLocation('all');
                setSelectedType('all');
                setSearchQuery('');
                fetchBikes();
              }}
            />
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LocationsPage;