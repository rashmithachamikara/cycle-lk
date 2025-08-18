//frontend-web/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Star, 
  Bike, 
  Navigation, 
  Shield, 
  Globe, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { locationService, Location } from '../services/locationService';
import LocationCard from '../components/LocationsPage/LocationCard';

const HomePage = () => {

  // const [selectedPackage, setSelectedPackage] = useState('week');
  // const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  // const [selectedLocation, setSelectedLocation] = useState('Colombo');
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  // const packages = [
  //   {
  //     id: 'day',
  //     name: '1-Day Explorer',
  //     price: '$15',
  //     duration: '24 hours',
  //     features: ['1 city coverage', 'Basic insurance', 'GPS tracking', 'Customer support'],
  //     popular: false
  //   },
  //   {
  //     id: 'week',
  //     name: '1-Week Adventure',
  //     price: '$89',
  //     duration: '7 days',
  //     features: ['3 cities coverage', 'Premium insurance', 'Route suggestions', '24/7 support'],
  //     popular: true
  //   },
  //   {
  //     id: 'month',
  //     name: '1-Month Journey',
  //     price: '$299',
  //     duration: '30 days',
  //     features: ['Unlimited coverage', 'Full insurance', 'Concierge service', 'Priority support'],
  //     popular: false
  //   }
  // ];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const data = await locationService.getAllLocations();
        setLocations(data);
      } catch (err:any) {
        setLocationsError(`Failed to load locations. ${err.message}`);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Multi-Location Network',
      description: 'Pick up and drop off bikes at any of our 50+ partner locations across Sri Lanka'
    },
    {
      icon: <Navigation className="h-8 w-8" />,
      title: 'Smart Route Planning',
      description: 'Get personalized route suggestions based on your interests and fitness level'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Complete Insurance',
      description: 'Comprehensive coverage for peace of mind during your cycling adventures'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Multi-Currency Support',
      description: 'Pay in your preferred currency with secure international payment processing'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      country: 'Australia',
      rating: 5,
      text: 'Amazing experience! Being able to cycle from Colombo to Kandy and drop off the bike there made our trip so much more flexible.',
      avatar: 'SJ'
    },
    {
      name: 'Marco Silva',
      country: 'Brazil',
      rating: 5,
      text: 'The bikes were in excellent condition and the GPS tracking made me feel safe. Highly recommend for eco-conscious travelers!',
      avatar: 'MS'
    },
    {
      name: 'Emma Thompson',
      country: 'UK',
      rating: 5,
      text: 'Perfect way to explore Sri Lanka\'s hidden gems. The route suggestions led us to breathtaking views we would have missed otherwise.',
      avatar: 'ET'
    }
  ];

  // Handler for LocationCard (no-op for View Bikes, navigate for More Details)
  const handleMoreDetails = (locationId: string) => {
    // You can use a navigation hook if needed, or just link to /location/:id
    window.location.href = `/location/${locationId}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
        <section className="relative overflow-hidden h-[94vh]">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/di9vcyned/video/upload/f_auto,q_auto/v1755452159/Sri_lanka_Video_4_l3x1lu.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content Container - Centered Vertically */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content Column */}
            <div className="space-y-6 sm:space-y-8 text-white">
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ travelers</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
                Explore
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg"> Sri Lanka</span>
                <br />
                Your Way
              </h1>
              
              {/* Intro Paragraph */}
              <p className="text-lg text-gray-200 leading-relaxed max-w-lg drop-shadow-md">
                Discover the pearl of the Indian Ocean with our flexible bike rental network. 
                Pick up in one city, drop off in another, and explore at your own pace.
              </p>

              {/* Mini Feature List */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-md pt-2">
                  <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>Island-wide pick-up</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>Safe & insured rides</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>Eco-friendly travel</span>
                  </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                <Link 
                  to="/booking"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-lg text-center"
                >
                  Start Your Journey
                </Link>
                <button className="border-2 border-white/60 text-white px-8 py-4 rounded-xl hover:border-emerald-400 hover:bg-emerald-400/20 transition-all duration-300 font-semibold text-lg backdrop-blur-sm text-center">
                  View Destinations
                </button>
              </div>

              {/* Extra note */}
              <p className="text-sm text-gray-300 pt-2">
                  🌍 Every trip supports local communities & sustainable tourism.
              </p>
            </div>

            {/* Right Booking Widget Column (Commented Out) */}
            {/* 
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Booking</h3>
              
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pick-up Location</label>
                  <button
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="w-full flex items-center justify-between p-4 border border-gray-300 bg-white rounded-xl hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-emerald-500 mr-3" />
                      <span className="text-gray-700">{selectedLocation}</span>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      {locations.map((location) => (
                        <button
                          key={location.name}
                          onClick={() => {
                            setSelectedLocation(location.name);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between first:rounded-t-xl last:rounded-b-xl"
                        >
                          <span className="text-gray-700">{location.name}</span>
                          <span className="text-sm text-emerald-600">{location.bikes} Bikes</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 bg-white rounded-xl hover:border-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select className="w-full pl-12 pr-4 py-4 border border-gray-300 bg-white rounded-xl hover:border-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors appearance-none">
                        <option>1 Day</option>
                        <option>1 Week</option>
                        <option>1 Month</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <Link 
                  to="/booking"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg text-center block"
                >
                  Search Available Bikes
                </Link>

                <div className="flex items-center justify-center text-sm text-gray-600">
                  <ShieldCheck className="h-4 w-4 mr-2 text-gray-500" />
                  Free cancellation up to 24 hours before
                </div>
              </div>
            </div> 
            */}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Cycle.LK Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the freedom of flexible bike rentals across Sri Lanka's most beautiful destinations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              // { step: '01', title: 'Choose Package', desc: 'Select your preferred rental duration and coverage area', icon: <Calendar className="h-8 w-8" /> },
              { step: '01', title: 'Pick Location', desc: 'Choose from 50+ partner locations across Sri Lanka', icon: <MapPin className="h-8 w-8" /> },
              { step: '02', title: 'Start Cycling', desc: 'Unlock your bike with QR code and begin exploring', icon: <Bike className="h-8 w-8" /> },
              { step: '03', title: 'Drop Anywhere', desc: 'Return your bike at any partner location in your network', icon: <CheckCircle className="h-8 w-8" /> }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-0.5 bg-orange-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Plans */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible packages designed for every type of traveler, from day explorers to month-long adventurers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 transform hover:scale-105 border-2 ${
                  pkg.popular ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-gray-100 hover:border-emerald-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl font-bold text-emerald-600">{pkg.price}</span>
                    <span className="text-gray-500 ml-2">/ {pkg.duration}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/booking"
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 text-center block ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg'
                      : 'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Cycle.LK</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most advanced and tourist-friendly bike rental platform in Sri Lanka
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-emerald-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Beautiful Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our partner network spans across Sri Lanka's most iconic destinations
            </p>
          </div>

          {locationsLoading ? (
            <div className="text-center py-12 text-gray-500">Loading locations...</div>
          ) : locationsError ? (
            <div className="text-center py-12 text-red-500">{locationsError}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.slice(0, 6).map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onMoreDetails={handleMoreDetails}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/locations"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              View All Locations
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied travelers who've explored Sri Lanka with Cycle.LK
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;