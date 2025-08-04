import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Star, 
  Bike as BikeIcon,
  Grid3X3,
  List,
  Search
} from 'lucide-react';

import { Partner, partnerService } from '../services/partnerService';
import { Bike } from '../services/bikeService';
import { Loader, ErrorDisplay, BackButton } from '../ui';

const PartnerBikesPage = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch partner and bikes data
  const fetchPartnerData = useCallback(async () => {
    if (!partnerId) {
      setError('Partner ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch partner details and bikes in parallel
      const [partnerResponse, bikesResponse] = await Promise.all([
        partnerService.getPartnerById(partnerId),
        partnerService.getPartnerBikes(partnerId)
      ]);
      
      setPartner(partnerResponse);
      setBikes(bikesResponse);
    } catch (err: unknown) {
      console.error('Error fetching partner data:', err);
      let errorMessage = 'Failed to load partner bikes. Please try again later.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  // Filter and sort bikes
  const filteredAndSortedBikes = bikes
    .filter(bike => {
      // Search filter
      if (searchQuery && !bike.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !bike.type.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType !== 'all' && bike.type !== filterType) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.pricing.perDay - b.pricing.perDay;
        case 'price-high':
          return b.pricing.perDay - a.pricing.perDay;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Get unique bike types for filter
  const bikeTypes = [...new Set(bikes.map(bike => bike.type))];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loader message="Loading partner bikes..." size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorDisplay 
            error={error} 
            onRetry={fetchPartnerData}
            fullPage={true}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <BikeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner not found</h3>
            <p className="text-gray-600">The requested partner could not be found.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Partner Header Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <BackButton to="/partners" className="mr-4" />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{partner.companyName}</h1>
              <div className="flex items-center text-emerald-100">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{partner.location}</span>
                {partner.verified && (
                  <span className="ml-4 bg-blue-500 px-3 py-1 rounded-full text-sm font-semibold">
                    Verified Partner
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Partner Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{bikes.length}</div>
              <div className="text-emerald-100 text-sm">Available Bikes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{partner.rating || 'N/A'}</div>
              <div className="text-emerald-100 text-sm">Rating</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{partner.yearsActive || 0}</div>
              <div className="text-emerald-100 text-sm">Years Active</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{bikeTypes.length}</div>
              <div className="text-emerald-100 text-sm">Bike Types</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bikes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-4">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Types</option>
                {bikeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high' | 'rating')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedBikes.length} of {bikes.length} bikes
          </div>
        </div>

        {/* Bikes Grid/List */}
        {filteredAndSortedBikes.length === 0 ? (
          <div className="text-center py-12">
            <BikeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bikes found</h3>
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'This partner has no bikes available at the moment.'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
          }>
            {filteredAndSortedBikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// BikeCard Component
interface BikeCardProps {
  bike: Bike;
  viewMode: 'grid' | 'list';
}

const BikeCard: React.FC<BikeCardProps> = ({ bike, viewMode }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/bikes/${bike.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-emerald-400 to-teal-500 relative">
            {bike.images && bike.images[0] ? (
              <img 
                src={bike.images[0]} 
                alt={bike.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BikeIcon className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {bike.type}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{bike.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{bike.location}</span>
                </div>
                {bike.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {bike.rating} ({bike.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  LKR {bike.pricing.perDay.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per day</div>
              </div>
            </div>

            {bike.description && (
              <p className="text-gray-700 mb-4 line-clamp-2">{bike.description}</p>
            )}

            {/* Features */}
            {bike.features && bike.features.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {bike.features.slice(0, 4).map((feature: string, index: number) => (
                    <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                  {bike.features.length > 4 && (
                    <span className="text-gray-500 text-xs">+{bike.features.length - 4} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  bike.availability?.status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {bike.availability?.status ? 'Available' : 'Unavailable'}
                </span>
                {bike.condition && (
                  <span>Condition: {bike.condition}</span>
                )}
              </div>
              
              <button
                onClick={handleViewDetails}
                className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
        {bike.images && bike.images[0] ? (
          <img 
            src={bike.images[0]} 
            alt={bike.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BikeIcon className="h-12 w-12 text-white" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {bike.type}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            bike.availability?.status 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {bike.availability?.status ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{bike.name}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{bike.location}</span>
            </div>
            {bike.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {bike.rating} ({bike.reviews?.length || 0})
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-600">
              LKR {bike.pricing.perDay.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">per day</div>
          </div>
        </div>

        {bike.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{bike.description}</p>
        )}

        {/* Features */}
        {bike.features && bike.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {bike.features.slice(0, 3).map((feature: string, index: number) => (
                <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                  {feature}
                </span>
              ))}
              {bike.features.length > 3 && (
                <span className="text-gray-500 text-xs">+{bike.features.length - 3}</span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleViewDetails}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default PartnerBikesPage;
