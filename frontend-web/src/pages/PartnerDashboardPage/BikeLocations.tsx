import { useEffect, useState } from "react";
import { MapPin, Bike as BikeIcon, Search, RefreshCw, Eye, AlertCircle, Clock, CheckCircle, Map, List, Navigation } from 'lucide-react';
import { Bike, bikeService } from "../../services/bikeService";
import Header from "../../components/Header";
import { Loader } from "../../ui";
import { Link } from "react-router-dom";

interface BikeLocation {
  locationName: string;
  partnerName: string;
  partnerId: string;
  bikes: Bike[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

type ViewMode = 'list' | 'map';

const BikeLocations = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [groupedLocations, setGroupedLocations] = useState<BikeLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const fetchBikes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const bikeList = await bikeService.getMyBikes();
      setBikes(bikeList);
      groupBikesByLocation(bikeList);
    } catch (err) {
      setError('Failed to fetch bike locations. Please try again.');
      console.error('Error fetching bikes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const groupBikesByLocation = (bikeList: Bike[]) => {
    const locationMap: { [key: string]: BikeLocation } = {};

    bikeList.forEach(bike => {
      // Get location info from currentPartnerId
      const locationName = bike.location || 'Unknown Location';
      const partnerName = typeof bike.currentPartnerId === 'object' && bike.currentPartnerId 
        ? bike.currentPartnerId.companyName 
        : 'Unknown Partner';
      const partnerId = typeof bike.currentPartnerId === 'object' && bike.currentPartnerId 
        ? bike.currentPartnerId._id 
        : bike.currentPartnerId || '';

      const locationKey = `${locationName}-${partnerId}`;

      if (!locationMap[locationKey]) {
        locationMap[locationKey] = {
          locationName,
          partnerName,
          partnerId,
          bikes: [],
          coordinates: bike.coordinates
        };
      }

      locationMap[locationKey].bikes.push(bike);
    });

    const grouped = Object.values(locationMap);
    setGroupedLocations(grouped);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBikes();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchBikes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter locations based on search term
  const filteredLocations = groupedLocations.filter(location =>
    location.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.bikes.some(bike => 
      bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bike.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'requested':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unavailable':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'requested':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTotalBikesByStatus = () => {
    const stats = {
      available: 0,
      unavailable: 0,
      requested: 0,
      total: bikes.length
    };

    bikes.forEach(bike => {
      const status = bike.availability?.status || 'unavailable';
      if (status in stats) {
        stats[status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const stats = getTotalBikesByStatus();

  const openInGoogleMaps = (location: BikeLocation) => {
    if (location.coordinates) {
      const { latitude, longitude } = location.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      const query = encodeURIComponent(`${location.locationName}, Sri Lanka`);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bike Locations</h1>
            <p className="text-gray-600">Track where your bikes are currently located across different partners</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-[#00D4AA] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4 mr-2 inline" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'map' 
                    ? 'bg-[#00D4AA] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Map className="h-4 w-4 mr-2 inline" />
                Map
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-[#00D4AA] text-white rounded-lg hover:bg-[#00B399] transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <BikeIcon className="h-8 w-8 text-[#00D4AA]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bikes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requested</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.requested}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">{stats.unavailable}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by location, partner, or bike name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Map View Placeholder */}
        {viewMode === 'map' && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
              <p className="text-gray-600 mb-4">Interactive map showing bike locations is coming soon!</p>
              <p className="text-sm text-gray-500">For now, use the location buttons below to view individual locations on Google Maps.</p>
            </div>
          </div>
        )}

        {/* Location Groups */}
        {viewMode === 'list' && (
          <>
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <BikeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No bikes found' : 'No bikes available'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find bikes.' 
                    : 'Start by adding bikes to your inventory.'
                  }
                </p>
                {!searchTerm && (
                  <Link
                    to="/partner-dashboard/add-bike"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-[#00D4AA] text-white rounded-lg hover:bg-[#00B399] transition-colors duration-200"
                  >
                    Add Your First Bike
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredLocations.map((location, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Location Header */}
                    <div className="bg-gradient-to-r from-[#00D4AA] to-[#20B2AA] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="h-6 w-6 text-white mr-3" />
                          <div>
                            <h3 className="text-xl font-semibold text-white">{location.locationName}</h3>
                            <p className="text-green-100">{location.partnerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => openInGoogleMaps(location)}
                            className="inline-flex items-center px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 text-sm"
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            View on Map
                          </button>
                          <div className="text-right">
                            <p className="text-green-100 text-sm">Bikes at this location</p>
                            <p className="text-2xl font-bold text-white">{location.bikes.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bikes Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {location.bikes.map((bike) => (
                          <div key={bike.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{bike.name}</h4>
                                <p className="text-sm text-gray-600 capitalize">{bike.type} bike</p>
                              </div>
                              <div className="ml-2">
                                {bike.images && bike.images.length > 0 ? (
                                  <img 
                                    src={bike.images[0].url} 
                                    alt={bike.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <BikeIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bike.availability?.status || 'unavailable')}`}>
                                {getStatusIcon(bike.availability?.status || 'unavailable')}
                                <span className="ml-1 capitalize">{bike.availability?.status || 'unavailable'}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-[#00D4AA]">
                                  LKR {bike.pricing.perDay.toLocaleString()}/day
                                </span>
                                <Link
                                  to={`/bikes/${bike.id}`}
                                  className="p-1 text-gray-400 hover:text-[#00D4AA] transition-colors duration-200"
                                  title="View bike details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>

                            {bike.availability?.reason && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Note:</strong> {bike.availability.reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BikeLocations;
