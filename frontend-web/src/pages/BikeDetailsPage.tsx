import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { bikeService, Bike } from '../services/bikeService';
import { 
  Star, 
  MapPin, 
  Shield, 
  Bike as BikeIcon, 
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  MessageCircle
} from 'lucide-react';

const BikeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bike data
  useEffect(() => {
    const fetchBike = async () => {
      if (!id) {
        navigate('/locations');
        return;
      }

      try {
        setLoading(true);
        const bikeData = await bikeService.getBikeById(id);
        setBike(bikeData);
      } catch (err) {
        setError('Failed to load bike details. Please try again later.');
        console.error('Error fetching bike:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [id, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600">Loading bike details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || !bike) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <BikeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'Bike not found'}
            </h3>
            <p className="text-gray-600 mb-6">
              The bike you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/locations"
              className="inline-flex items-center bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bikes
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper function to format price in LKR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to format business hours
  const formatBusinessHours = (businessHours: string | { [key: string]: string } | undefined) => {
    if (!businessHours) return 'Contact for hours';
    
    if (typeof businessHours === 'string') {
      return businessHours;
    }
    
    // If it's an object, format it nicely
    if (typeof businessHours === 'object') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const workingDays = days.filter(day => businessHours[day] && businessHours[day] !== 'Closed');
      
      if (workingDays.length === 0) return 'Closed';
      if (workingDays.length === 7) return 'Open daily';
      if (workingDays.length === 5 && workingDays.includes('monday') && workingDays.includes('friday')) {
        return 'Mon-Fri';
      }
      
      return `${workingDays.length} days/week`;
    }
    
    return 'Contact for hours';
  };

  // Calculate weekly and monthly prices if available
  const weeklyPrice = bike.pricing.perWeek || bike.pricing.perDay * 6; // 1 day free
  const monthlyPrice = bike.pricing.perMonth || bike.pricing.perDay * 25; // 5 days free

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link to="/locations" className="hover:text-emerald-600">Locations</Link>
          <span>/</span>
          <span className="text-gray-900">{bike.name}</span>
        </div>

        {/* Back Button */}
        <Link
          to="/locations"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bikes
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-2xl overflow-hidden">
              <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative">
                {bike.images && bike.images.length > 0 ? (
                  <img
                    src={bike.images[selectedImage]}
                    alt={bike.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to bike icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.removeAttribute('style');
                    }}
                  />
                ) : (
                  <BikeIcon className="h-32 w-32 text-gray-400" />
                )}
                <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-sm text-gray-700">
                  {bike.images && bike.images.length > 0 ? `Image ${selectedImage + 1} of ${bike.images.length}` : bike.name}
                </div>
              </div>
            </div>
            
            {bike.images && bike.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {bike.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-emerald-500' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <img
                        src={image}
                        alt={`${bike.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.removeAttribute('style');
                        }}
                      />
                      <BikeIcon className="h-8 w-8 text-gray-400" style={{ display: 'none' }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bike Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{bike.name}</h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-lg border ${
                      isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-600'
                    } hover:scale-110 transition-transform`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:scale-110 transition-transform">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {bike.type}
                </span>
                {bike.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {bike.rating} ({bike.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}
                {bike.condition && (
                  <span className="text-sm text-gray-600 capitalize">
                    Condition: {bike.condition}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{bike.location}</span>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{bike.description || 'No description available.'}</p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">{formatPrice(bike.pricing.perDay)}</div>
                  <div className="text-gray-600">per day</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Weekly rate</div>
                  <div className="text-xl font-semibold text-gray-900">{formatPrice(weeklyPrice)}</div>
                  {bike.pricing.perWeek && bike.pricing.perWeek < bike.pricing.perDay * 7 && (
                    <div className="text-xs text-emerald-600">
                      Save {formatPrice(bike.pricing.perDay * 7 - bike.pricing.perWeek)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available now:</span>
                  <span className={`font-medium ${bike.availability?.status ? 'text-green-600' : 'text-red-600'}`}>
                    {bike.availability?.status ? 'Yes' : 'No'}
                  </span>
                </div>
                {monthlyPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monthly rate:</span>
                    <span className="font-medium text-gray-900">{formatPrice(monthlyPrice)}</span>
                  </div>
                )}
              </div>
              
              <Link
                to={`/booking?bikeId=${bike.id}`}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl hover:bg-emerald-600 transition-colors font-semibold text-lg text-center block"
              >
                Book This Bike
              </Link>
              
              <div className="flex items-center justify-center text-sm text-gray-500 mt-3">
                <Shield className="h-4 w-4 mr-2" />
                Free cancellation up to 24 hours before
              </div>
            </div>

            {/* Partner Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Shop</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    {bike.partner?.companyName || `Partner ID: ${bike.partnerId}`}
                  </div>
                  {bike.partner?.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{bike.partner.rating} partner rating</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">
                    {bike.partner?.location || 'Contact for more details'}
                  </div>
                  {bike.partner?.businessHours && (
                    <div className="text-sm text-gray-600 mt-1">
                      Hours: {formatBusinessHours(bike.partner.businessHours)}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {bike.partner?.phone && (
                    <a
                      href={`tel:${bike.partner.phone}`}
                      className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  )}
                  {bike.partner?.email && (
                    <a
                      href={`mailto:${bike.partner.email}`}
                      className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  )}
                  {!bike.partner?.phone && !bike.partner?.email && (
                    <button className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg text-sm cursor-not-allowed">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contact
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features & Specifications */}
        <div className="grid lg:grid-cols-2 gap-12 mt-12">
          {bike.features && bike.features.length > 0 && (
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Features & Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {bike.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bike.specifications && Object.keys(bike.specifications).length > 0 && (
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h3>
              <div className="space-y-4">
                {Object.entries(bike.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        {bike.reviews && bike.reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-8 mt-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Reviews ({bike.reviews.length})</h3>
              {bike.rating && (
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold text-gray-900 ml-2">{bike.rating}</span>
                  <span className="text-gray-600 ml-2">out of 5</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {bike.reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        U
                      </div>
                      <div className="ml-3">
                        <div className="font-semibold text-gray-900">User {review.userId.substring(0, 8)}</div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.helpful && (
                      <button className="text-sm text-gray-600 hover:text-emerald-600">
                        Helpful ({review.helpful})
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>

            {bike.reviews.length > 3 && (
              <div className="text-center mt-8">
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-emerald-500 transition-colors font-medium">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BikeDetailsPage;
