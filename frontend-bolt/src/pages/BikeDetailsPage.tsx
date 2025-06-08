import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Shield, 
  Bike, 
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2,
  Navigation,
  Clock,
  Users,
  Zap,
  Award,
  Phone,
  MessageCircle
} from 'lucide-react';

const BikeDetailsPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock bike data - in real app, this would be fetched based on ID
  const bike = {
    id: 1,
    name: 'City Cruiser Premium',
    type: 'Hybrid',
    rating: 4.8,
    reviews: 124,
    price: 15,
    location: 'Colombo Central',
    partner: 'Colombo Bikes',
    partnerRating: 4.9,
    partnerPhone: '+94 77 123 4567',
    description: 'Perfect for city exploration and comfortable rides through Colombo\'s bustling streets. This premium hybrid bike combines comfort with performance.',
    features: [
      'Comfortable gel seat',
      'Front basket included',
      'LED lights (front & rear)',
      '21-speed Shimano gears',
      'Anti-theft lock',
      'Phone holder',
      'Water bottle holder',
      'Puncture-resistant tires'
    ],
    specifications: {
      'Frame Size': 'Medium (54cm)',
      'Weight': '12.5 kg',
      'Max Rider Weight': '120 kg',
      'Brake Type': 'Disc brakes',
      'Tire Size': '700c x 35mm',
      'Gear System': '21-speed Shimano'
    },
    images: [
      'Premium hybrid bike with basket',
      'Side view showing gear system',
      'Close-up of comfortable seat',
      'LED lighting system'
    ],
    availability: {
      today: true,
      tomorrow: true,
      thisWeek: 5
    }
  };

  const reviews = [
    {
      id: 1,
      user: 'Sarah M.',
      rating: 5,
      date: '2025-02-15',
      comment: 'Excellent bike for exploring Colombo! Very comfortable and the basket was perfect for carrying my camera and water.',
      helpful: 12
    },
    {
      id: 2,
      user: 'David L.',
      rating: 5,
      date: '2025-02-10',
      comment: 'Great condition bike with smooth gears. The partner shop was very helpful with route suggestions.',
      helpful: 8
    },
    {
      id: 3,
      user: 'Emma K.',
      rating: 4,
      date: '2025-02-05',
      comment: 'Good bike overall. The seat was very comfortable for long rides. Only minor issue was the bell was a bit loose.',
      helpful: 5
    }
  ];

  const relatedBikes = [
    {
      id: 2,
      name: 'Urban Explorer',
      type: 'City Bike',
      rating: 4.7,
      price: 12,
      location: 'Colombo Central'
    },
    {
      id: 3,
      name: 'Comfort Cruiser',
      type: 'Hybrid',
      rating: 4.6,
      price: 18,
      location: 'Colombo Central'
    }
  ];

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
                <Bike className="h-32 w-32 text-gray-400" />
                <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-sm text-gray-700">
                  {bike.images[selectedImage]}
                </div>
              </div>
            </div>
            
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
                    <Bike className="h-8 w-8 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
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
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {bike.type}
                </span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{bike.rating} ({bike.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{bike.location}</span>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{bike.description}</p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">${bike.price}</div>
                  <div className="text-gray-600">per day</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Weekly rate</div>
                  <div className="text-xl font-semibold text-gray-900">${bike.price * 6}</div>
                  <div className="text-xs text-emerald-600">Save $9</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available today:</span>
                  <span className={`font-medium ${bike.availability.today ? 'text-green-600' : 'text-red-600'}`}>
                    {bike.availability.today ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available tomorrow:</span>
                  <span className={`font-medium ${bike.availability.tomorrow ? 'text-green-600' : 'text-red-600'}`}>
                    {bike.availability.tomorrow ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available this week:</span>
                  <span className="font-medium text-gray-900">{bike.availability.thisWeek} days</span>
                </div>
              </div>
              
              <Link
                to="/booking"
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
                  <div className="font-semibold text-gray-900">{bike.partner}</div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{bike.partnerRating} partner rating</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </button>
                  <button className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Professional bike rental service with 5+ years experience. Specializes in city tours and maintenance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features & Specifications */}
        <div className="grid lg:grid-cols-2 gap-12 mt-12">
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

          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h3>
            <div className="space-y-4">
              {Object.entries(bike.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-8 mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Reviews ({bike.reviews})</h3>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-lg font-semibold text-gray-900 ml-2">{bike.rating}</span>
              <span className="text-gray-600 ml-2">out of 5</span>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900">{review.user}</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-sm text-gray-600 hover:text-emerald-600">
                    Helpful ({review.helpful})
                  </button>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-emerald-500 transition-colors font-medium">
              Load More Reviews
            </button>
          </div>
        </div>

        {/* Related Bikes */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Other Bikes at This Location</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedBikes.map((relatedBike) => (
              <Link
                key={relatedBike.id}
                to={`/bike/${relatedBike.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Bike className="h-16 w-16 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold text-gray-900">{relatedBike.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{relatedBike.type}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{relatedBike.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-emerald-600">${relatedBike.price}/day</div>
                    <span className="text-sm text-gray-600">{relatedBike.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BikeDetailsPage;