import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Bike as BikeIcon
} from 'lucide-react';

import { Partner, partnerService } from '../services/partnerService';
import { Bike } from '../services/bikeService';
import { Loader, ErrorDisplay, SearchAndFilters, BikeGrid } from '../ui';

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
      console.log('Fetched partner:', partnerResponse); // Debug log
      console.log('Fetched bikes:', bikesResponse); // Debug log
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
      <section
        className="relative text-white py-12"
        style={
          partner?.images?.storefront?.url
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${partner.images.storefront.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <div className="absolute inset-0 bg-black/20"></div> {/* Optional overlay for better text readability */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{partner.companyName}</h1>
              <div className="flex items-center text-white">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {typeof partner.location === 'object' && partner.location.name 
                    ? partner.location.name 
                    : typeof partner.location === 'string' 
                    ? partner.location 
                    : 'Location not specified'
                  }
                </span>
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
            <div className="bg-teal-400/30 rounded-lg p-4 text-center backdrop-blur-xs">
              <div className="text-2xl text-white font-bold">{bikes.length}</div>
              <div className="text-white text-lg">Available Bikes</div>
            </div>
            <div className="bg-[#FF69B4]/50 rounded-lg p-4 text-center backdrop-blur-xs">
              <div className="text-2xl font-bold">{partner.rating || 'N/A'}</div>
              <div className="text-white text-lg">Rating</div>
            </div>
            <div className="bg-[#1E90FF]/50 rounded-lg p-4 text-center backdrop-blur-xs">
              <div className="text-2xl font-bold">{partner.yearsActive || 0}</div>
              <div className="text-white text-lg">Years Active</div>
            </div> 
            <div className="bg-[#FF7F50]/50 rounded-lg p-4 text-center backdrop-blur-xs">
              <div className="text-2xl font-bold">{bikeTypes.length}</div>
              <div className="text-white text-lg">Bike Types</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search bikes..."
          filterOptions={bikeTypes.map(type => ({ value: type, label: type }))}
          filterValue={filterType}
          onFilterChange={setFilterType}
          filterLabel="All Types"
          sortOptions={[
            { value: 'name', label: 'Sort by Name' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'rating', label: 'Rating' }
          ]}
          sortValue={sortBy}
          onSortChange={(value) => setSortBy(value as 'name' | 'price-low' | 'price-high' | 'rating')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          totalResults={bikes.length}
          filteredResults={filteredAndSortedBikes.length}
          resultsLabel="bikes"
          className="mb-8"
        />

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
          <BikeGrid bikes={filteredAndSortedBikes} viewMode={viewMode} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PartnerBikesPage;
