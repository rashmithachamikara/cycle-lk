import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { partnerService, Partner, isPartnerOpen } from '../services/partnerService';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Building,
  Bike,
  AlertTriangle,
  Loader,
  Image as ImageIcon,
  CheckCircle,
  Calendar,
  Users,
  MessageSquare,
  Heart,
  Share
} from 'lucide-react';

const PartnerPublicProfilePage = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number | null>(null);

  useEffect(() => {
    if (partnerId) {
      fetchPartnerDetails();
    }
  }, [partnerId]);

  const fetchPartnerDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const partnerData = await partnerService.getPartnerById(partnerId!);
      
      // Only show if partner is active
      if (partnerData.status !== 'active') {
        setError('Partner profile not available');
        return;
      }
      
      setPartner(partnerData);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      setError('Failed to load partner profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getPartnerLocation = (partner: Partner): string => {
    if (typeof partner.location === 'object' && partner.location?.name) {
      return partner.location.name;
    }
    return partner.address || partner.location as string || 'Location not specified';
  };

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  const isImageError = (imageId: string): boolean => {
    return imageErrors.has(imageId);
  };

  const handleBookNow = () => {
    // Navigate to bikes listing filtered by this partner
    navigate(`/partners/${partner?._id}/bikes`);
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${partner?.companyName} - Cycle.LK`,
          text: `Check out ${partner?.companyName} on Cycle.LK`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading partner profile...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Available</h2>
            <p className="text-gray-600 mb-6">{error || 'Partner profile not found'}</p>
            <button
              onClick={() => navigate('/partners')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse All Partners
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleShareProfile}
              className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </button>
            <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors">
              <Heart className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-purple-600 to-indigo-700">
            {partner.images?.storefront && !isImageError(`hero-${partner._id}`) ? (
              <img
                src={partner.images.storefront.url}
                alt={partner.companyName}
                className="w-full h-full object-cover"
                onError={() => handleImageError(`hero-${partner._id}`)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building className="h-24 w-24 text-white opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {partner.images?.logo && !isImageError(`logo-${partner._id}`) ? (
                    <img
                      src={partner.images.logo.url}
                      alt={`${partner.companyName} Logo`}
                      className="w-16 h-16 rounded-lg bg-white p-2 object-contain"
                      onError={() => handleImageError(`logo-${partner._id}`)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-2">{partner.companyName}</h1>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getPartnerLocation(partner)}
                      </div>
                      {partner.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                          {partner.rating.toFixed(1)}
                        </div>
                      )}
                      {partner.verified && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isPartnerOpen(partner.businessHours) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {isPartnerOpen(partner.businessHours) ? 'Open Now' : 'Closed'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {partner.description || `${partner.companyName} is a trusted bike rental partner offering quality bikes and excellent service.`}
              </p>
              
              {(partner.specialties?.length || partner.features?.length) && (
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  {partner.specialties && partner.specialties.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.specialties.map((specialty, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {partner.features && partner.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.features.map((feature, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Bike className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{partner.bikeCount || 0}</div>
                  <div className="text-sm text-gray-600">Bikes Available</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{partner.yearsActive || 0}</div>
                  <div className="text-sm text-gray-600">Years Active</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {partner.rating ? partner.rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {partner.reviews?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {partner.images?.gallery && partner.images.gallery.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Gallery</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {partner.images.gallery.map((image, index) => (
                    <div key={index} className="relative cursor-pointer group" onClick={() => setSelectedGalleryImage(index)}>
                      {isImageError(`gallery-${partner._id}-${index}`) ? (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={image.url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          onError={() => handleImageError(`gallery-${partner._id}-${index}`)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {partner.reviews && partner.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
                
                <div className="space-y-6">
                  {partner.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="ml-2 font-medium text-gray-900">Customer</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {partner.reviews.length > 3 && (
                    <button className="text-purple-600 hover:text-purple-700 font-medium">
                      View all {partner.reviews.length} reviews
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book a Bike</h3>
              
              <button
                onClick={handleBookNow}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center mb-3"
              >
                <Bike className="h-5 w-5 mr-2" />
                View Available Bikes
              </button>
              
              <div className="text-sm text-gray-600 text-center">
                Browse and book from {partner.bikeCount || 0} available bikes
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              
              {partner.businessHours ? (
                <div className="space-y-2">
                  {Object.entries(partner.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium text-gray-900">{day}</span>
                      <span className="text-gray-600">
                        {hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Contact for business hours</p>
              )}
              
              <div className={`mt-4 text-center py-2 px-3 rounded-lg text-sm font-medium ${
                isPartnerOpen(partner.businessHours) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                Currently {isPartnerOpen(partner.businessHours) ? 'Open' : 'Closed'}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">{getPartnerLocation(partner)}</div>
                    {partner.address && partner.address !== getPartnerLocation(partner) && (
                      <div className="text-sm text-gray-600 mt-1">{partner.address}</div>
                    )}
                  </div>
                </div>
                
                {partner.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <a href={`tel:${partner.phone}`} className="text-purple-600 hover:text-purple-700">
                      {partner.phone}
                    </a>
                  </div>
                )}
                
                {partner.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <a href={`mailto:${partner.email}`} className="text-purple-600 hover:text-purple-700">
                      {partner.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Partner Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{partner.category || 'Bike Rental'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Partner Since</span>
                  <span className="font-medium">
                    {new Date(partner.createdAt || '').getFullYear() || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified</span>
                  <div className="flex items-center">
                    {partner.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-700 font-medium">Yes</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {selectedGalleryImage !== null && partner.images?.gallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedGalleryImage(null)}>
          <div className="max-w-4xl max-h-4xl p-4">
            <img
              src={partner.images.gallery[selectedGalleryImage].url}
              alt={`Gallery ${selectedGalleryImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PartnerPublicProfilePage;
