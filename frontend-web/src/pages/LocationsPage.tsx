import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Search, 
  Bike, 
  Star, 
  Grid,
  List,
  Loader,
  AlertCircle,
  MapIcon
} from 'lucide-react';

// Import services and interfaces
import { locationService, Location } from '../services/locationService';
import { bikeService, BikeFilterParams } from '../services/bikeService';

const LocationsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  
  // Updated state for API data
  const [locations, setLocations] = useState<Location[]>([]);
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);
  const [bikes, setBikes] = useState<any[]>([]);
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
  }, [searchQuery]);

  // Filter bikes based on search query client-side as well
  const filteredBikes = bikes.filter(bike => {
    // Only apply search filter client-side, other filters are handled by the API
    return searchQuery === '' || 
           bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           bike.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handler for location card click
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    // Scroll to the bike listings section
    document.getElementById('bike-listings')?.scrollIntoView({ behavior: 'smooth' });
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
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Locations</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Discover Sri Lanka's most beautiful destinations with our extensive network of bike rental partners
            </p>
          </div>
        </div>
      </section>

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
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading locations...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <div className="text-red-600 mb-2 font-medium">{error}</div>
              <button 
                onClick={() => {
                  setError(null);
                  fetchLocations();
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(popularLocations.length > 0 ? popularLocations : locations.slice(0, 6)).map((location) => (
                <div 
                  key={location.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                  onClick={() => goToLocationDetail(location.id)}
                >
                    <div
                      className="h-48 relative overflow-hidden"
                      style={
                        location.image
                        ? {
                            backgroundImage: `url(${location.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { backgroundColor: '#e0f2f1' }
                      }
                    >
                      {location.popular && (
                        <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Popular
                        </div>
                      )}
                      {!location.image && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <MapIcon className="h-16 w-16 text-teal-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 group-hover:from-black/20 group-hover:to-black/70 transition-all duration-300"></div>
                      <div className="absolute bottom-4 left-6 text-white">
                        <div className="text-sm opacity-90">{location.region}</div>
                      </div>
                    </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{location.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{location.description || "Explore this beautiful location and rent bikes from our local partners."}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-emerald-600">
                        <Bike className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{location.bikeCount} bikes</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{location.partnerCount} partners</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationSelect(location.id);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-medium"
                      >
                        View Bikes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToLocationDetail(location.id);
                        }}
                        className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors duration-300 font-medium"
                      >
                        More Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!locationsLoading && !error && locations.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations available</h3>
              <p className="text-gray-600">We're currently expanding our network. Please check back later.</p>
            </div>
          )}
        </section>

        {/* Filters and Search */}
        <section className="mb-8" id="bike-listings">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bikes or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="mountain">Mountain</option>
                  <option value="beach">Beach Cruiser</option>
                  <option value="city">City Bike</option>
                  <option value="touring">Touring</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Bikes ({sortedBikes.length})
          </h2>
          {selectedLocation !== 'all' && (
            <button
              onClick={() => setSelectedLocation('all')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear location filter
            </button>
          )}
        </div>

        {/* Bike Listings */}
        <section>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading bikes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">{error}</div>
              <button 
                onClick={() => {
                  setError(null);
                  fetchBikes();
                }}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Retry
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedBikes.map((bike) => (
                <div key={bike.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {bike.images && bike.images.length > 0 ? (
                      <img 
                        src={bike.images[0]} 
                        alt={bike.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bike className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {!bike.available && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Unavailable
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{bike.name}</h3>
                      <div className="text-lg font-bold text-emerald-600">${bike.pricing.perDay}/day</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{bike.rating || 'N/A'} ({bike.reviews?.length || 0})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{bike.location} • {bike.partner?.name || 'Partner'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {bike.features && bike.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-3">
                      <Link
                        to={`/bike/${bike.id}`}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/booking/${bike.id}`}
                        className={`flex-1 py-3 rounded-lg font-medium text-center transition-colors ${
                          bike.available
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {bike.available ? 'Book Now' : 'Unavailable'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedBikes.map((bike) => (
                <div key={bike.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="grid md:grid-cols-4 gap-6 items-center">
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative">
                      {bike.images && bike.images.length > 0 ? (
                        <img 
                          src={bike.images[0]} 
                          alt={bike.name} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Bike className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">{bike.name}</h3>
                        {!bike.available && (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            Unavailable
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{bike.rating || 'N/A'} ({bike.reviews?.length || 0})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{bike.location} • {bike.partner?.name || 'Partner'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {bike.features && bike.features.map((feature, index) => (
                          <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-emerald-600">${bike.pricing.perDay}/day</div>
                      <div className="flex flex-col space-y-2">
                        <Link
                          to={`/bike/${bike.id}`}
                          className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/booking/${bike.id}`}
                          className={`py-2 px-4 rounded-lg font-medium text-center transition-colors ${
                            bike.available
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {bike.available ? 'Book Now' : 'Unavailable'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && sortedBikes.length === 0 && (
            <div className="text-center py-12">
              <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSelectedLocation('all');
                  setSelectedType('all');
                  setSearchQuery('');
                  fetchBikes();
                }}
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LocationsPage;