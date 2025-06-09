import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Search, 
  Filter, 
  Bike, 
  Star, 
  Navigation,
  Clock,
  Phone,
  ChevronDown,
  Grid,
  List,
  SortAsc
} from 'lucide-react';

const LocationsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');

  const locations = [
    {
      id: 'colombo',
      name: 'Colombo',
      description: 'Bustling capital city with colonial architecture',
      bikeCount: 45,
      partnerCount: 8,
      image: 'Modern cityscape with colonial buildings',
      popular: true
    },
    {
      id: 'kandy',
      name: 'Kandy',
      description: 'Cultural capital with Temple of the Tooth',
      bikeCount: 32,
      partnerCount: 5,
      image: 'Temple and lush green hills',
      popular: true
    },
    {
      id: 'galle',
      name: 'Galle',
      description: 'Historic fort city on the southern coast',
      bikeCount: 28,
      partnerCount: 6,
      image: 'Dutch fort and ocean views',
      popular: false
    },
    {
      id: 'ella',
      name: 'Ella',
      description: 'Mountain town with tea plantations',
      bikeCount: 24,
      partnerCount: 4,
      image: 'Tea estates and mountain vistas',
      popular: true
    },
    {
      id: 'sigiriya',
      name: 'Sigiriya',
      description: 'Ancient rock fortress and archaeological site',
      bikeCount: 18,
      partnerCount: 3,
      image: 'Ancient rock formation',
      popular: false
    },
    {
      id: 'negombo',
      name: 'Negombo',
      description: 'Beach town near the airport',
      bikeCount: 35,
      partnerCount: 7,
      image: 'Fishing boats and sandy beaches',
      popular: false
    }
  ];

  const bikes = [
    {
      id: 1,
      name: 'City Cruiser Premium',
      type: 'Hybrid',
      location: 'Colombo',
      partner: 'Colombo Bikes',
      rating: 4.8,
      reviews: 124,
      price: 15,
      features: ['Basket', 'LED lights', '21-speed'],
      available: true,
      image: 'Premium hybrid bike with basket'
    },
    {
      id: 2,
      name: 'Mountain Explorer',
      type: 'Mountain Bike',
      location: 'Kandy',
      partner: 'Hill Country Cycles',
      rating: 4.9,
      reviews: 89,
      price: 20,
      features: ['Shock absorbers', 'All-terrain', '24-speed'],
      available: true,
      image: 'Rugged mountain bike'
    },
    {
      id: 3,
      name: 'Beach Rider',
      type: 'Beach Cruiser',
      location: 'Galle',
      partner: 'Coastal Bikes',
      rating: 4.7,
      reviews: 156,
      price: 12,
      features: ['Wide tires', 'Rust-resistant', 'Cup holder'],
      available: true,
      image: 'Classic beach cruiser'
    },
    {
      id: 4,
      name: 'Tea Trail Bike',
      type: 'Touring',
      location: 'Ella',
      partner: 'Mountain View Rentals',
      rating: 4.6,
      reviews: 67,
      price: 18,
      features: ['Comfortable seat', 'Panniers', '18-speed'],
      available: false,
      image: 'Touring bike for long distances'
    },
    {
      id: 5,
      name: 'Heritage Explorer',
      type: 'City Bike',
      location: 'Sigiriya',
      partner: 'Ancient City Bikes',
      rating: 4.5,
      reviews: 43,
      price: 14,
      features: ['Upright position', 'Chain guard', '7-speed'],
      available: true,
      image: 'Classic city bike'
    },
    {
      id: 6,
      name: 'Airport Shuttle',
      type: 'Hybrid',
      location: 'Negombo',
      partner: 'Airport Bikes',
      rating: 4.4,
      reviews: 92,
      price: 13,
      features: ['Luggage rack', 'Quick release', '16-speed'],
      available: true,
      image: 'Practical hybrid for travelers'
    }
  ];

  const filteredBikes = bikes.filter(bike => {
    const matchesLocation = selectedLocation === 'all' || bike.location.toLowerCase() === selectedLocation;
    const matchesType = selectedType === 'all' || bike.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesSearch = bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bike.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesType && matchesSearch;
  });

  const sortedBikes = [...filteredBikes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Destinations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div key={location.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 relative overflow-hidden">
                  {location.popular && (
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-6 text-white">
                    <div className="text-sm opacity-90">{location.image}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{location.name}</h3>
                  <p className="text-gray-600 mb-4">{location.description}</p>
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
                  <button
                    onClick={() => setSelectedLocation(location.id)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors duration-300 font-medium"
                  >
                    View Bikes in {location.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters and Search */}
        <section className="mb-8">
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
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedBikes.map((bike) => (
                <div key={bike.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bike className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white/90 px-2 py-1 rounded text-xs text-gray-700">
                      {bike.image}
                    </div>
                    {!bike.available && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Unavailable
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{bike.name}</h3>
                      <div className="text-lg font-bold text-emerald-600">${bike.price}/day</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{bike.rating} ({bike.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{bike.location} • {bike.partner}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {bike.features.slice(0, 3).map((feature, index) => (
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
                        to="/booking"
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
                      <Bike className="h-12 w-12 text-gray-400" />
                      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-700">
                        {bike.image}
                      </div>
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
                          <span className="text-sm text-gray-600 ml-1">{bike.rating} ({bike.reviews})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{bike.location} • {bike.partner}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {bike.features.map((feature, index) => (
                          <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-emerald-600">${bike.price}/day</div>
                      <div className="flex flex-col space-y-2">
                        <Link
                          to={`/bike/${bike.id}`}
                          className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center"
                        >
                          View Details
                        </Link>
                        <Link
                          to="/booking"
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

          {sortedBikes.length === 0 && (
            <div className="text-center py-12">
              <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSelectedLocation('all');
                  setSelectedType('all');
                  setSearchQuery('');
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