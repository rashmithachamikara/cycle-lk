import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Bike, 
  Award,
  Users,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Navigation,
  Shield,
  Heart
} from 'lucide-react';

import { Partner, partnerService, formatBusinessHours } from '../services/partnerService';
import { Loader, ErrorDisplay } from '../ui';

const PartnersPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPartners = await partnerService.getAllPartners();
      console.log('Fetched partners:', allPartners); // Debug log
      setPartners(allPartners);
      
      // Generate categories from fetched data
      const categoryMap = new Map<string, number>();
      categoryMap.set('all', allPartners.length);
      
      allPartners.forEach(partner => {
        if (partner.category) {
          categoryMap.set(partner.category, (categoryMap.get(partner.category) || 0) + 1);
        }
      });
      
      const categoryList = Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: id === 'all' ? 'All Partners' : id,
        count
      }));
      
      setCategories(categoryList);
    } catch (err: unknown) {
      console.error('Error fetching partners:', err);
      let errorMessage = 'Failed to load partners. Please try again later.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = selectedCategory === 'all' 
    ? partners 
    : partners.filter(partner => partner.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loader message="Loading partners..." size="lg" />
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
            onRetry={fetchPartners}
            fullPage={true}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Trusted Partners</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Meet the local bike rental experts who make your Sri Lankan adventure possible
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <section className="mb-12">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{partners.length}</div>
              <div className="text-gray-600">Trusted Partners</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">6</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bike className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {partners.reduce((sum, partner: Partner) => sum + (partner.bikeCount || 0), 0)}
              </div>
              <div className="text-gray-600">Total Bikes</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">4.7</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section>
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <Bike className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners found</h3>
              <p className="text-gray-600">Try selecting a different category or check back later.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredPartners.map((partner) => (
                <div key={partner.id || partner._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Partner Header */}
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 relative overflow-hidden">
                  {partner.images?.storefront && (
                    <img 
                      src={partner.images.storefront} 
                      alt={partner.companyName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4 flex space-x-2">
                    {partner.category && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        partner.category === 'Premium' ? 'bg-gold-500 text-white' :
                        partner.category === 'Adventure' ? 'bg-orange-500 text-white' :
                        partner.category === 'Beach' ? 'bg-blue-500 text-white' :
                        partner.category === 'Eco' ? 'bg-green-500 text-white' :
                        partner.category === 'Heritage' ? 'bg-purple-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {partner.category}
                      </span>
                    )}
                    {partner.verified && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-lg font-bold">{partner.companyName}</div>
                  </div>
                </div>

                  <div className="p-6">
                    {/* Partner Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{partner.companyName}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{partner.location}</span>
                        </div>
                        {partner.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {partner.rating} ({partner.reviews?.length || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-gray-700 mb-4">{partner.description || 'Professional bike rental service.'}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">{partner.bikeCount || 0}</div>
                        <div className="text-xs text-gray-600">Bikes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{partner.yearsActive || 0}</div>
                        <div className="text-xs text-gray-600">Years</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{partner.reviews?.length || 0}</div>
                        <div className="text-xs text-gray-600">Reviews</div>
                      </div>
                    </div>

                    {/* Specialties */}
                    {partner.specialties && partner.specialties.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {partner.specialties.map((specialty, index) => (
                            <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {partner.features && partner.features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {partner.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-emerald-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {partner.businessHours && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Hours: {formatBusinessHours(partner.businessHours)}</span>
                          </div>
                        )}
                        {partner.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <a href={`tel:${partner.phone}`} className="text-emerald-600 hover:underline">
                              {partner.phone}
                            </a>
                          </div>
                        )}
                        {partner.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <a href={`mailto:${partner.email}`} className="text-emerald-600 hover:underline">
                              {partner.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/locations?partnerId=${partner.id || partner._id}`}
                        className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-center"
                      >
                        View Bikes
                      </Link>
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex items-center justify-center bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      {partner.coordinates && (
                        <a
                          href={`https://maps.google.com/?q=${partner.coordinates.latitude},${partner.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 transition-colors"
                        >
                          <Navigation className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </section>

        {/* Partner Benefits */}
        <section className="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Our Partners Choose Cycle.LK</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our growing network of successful bike rental businesses across Sri Lanka
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Increased Bookings</h3>
              <p className="text-gray-600">
                Access to thousands of tourists looking for authentic local experiences
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Guaranteed payments with comprehensive insurance coverage for all rentals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Support</h3>
              <p className="text-gray-600">
                Professional photography, listing optimization, and promotional campaigns
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/support"
              className="bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors font-semibold text-lg inline-flex items-center"
            >
              Become a Partner
              <ExternalLink className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default PartnersPage;