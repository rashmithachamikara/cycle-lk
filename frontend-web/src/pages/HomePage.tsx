// // {/* ============================================= */}
// // {/* New UI Version 2 - By Bhashitha */}
// // {/* ============================================= */}


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
  Clock,
  ArrowRight
} from 'lucide-react';
import { locationService, Location } from '../services/locationService';
import LocationCard from '../components/LocationsPage/LocationCard';

const HomePage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const data = await locationService.getAllLocations();
        setLocations(data);
      } catch (err: unknown) {
        setLocationsError(`Failed to load locations. ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const howItWorksSteps = [
    { 
      step: '01', 
      title: 'Pick Location', 
      desc: 'Choose from 50+ partner locations across Sri Lanka for ultimate convenience and flexibility.', 
      icon: '/icons/Location-review-bro.svg',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      step: '02', 
      title: 'Start Cycling', 
      desc: 'Unlock your bike instantly with our app and begin your cycling adventure across beautiful Sri Lanka.', 
      icon: '/icons/bike-travellers-bro.svg',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      step: '03', 
      title: 'Drop Anywhere', 
      desc: 'Return your bike at any partner location within your network area when your journey is complete.', 
      icon: '/icons/Bicycle-shop-bro.svg',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Multi-Location Network',
      description: 'Pick up and drop off bikes at any of our 50+ partner locations across Sri Lanka.'
    },
    {
      icon: <Navigation className="h-8 w-8" />,
      title: 'Smart Route Planning',
      description: 'Get personalized route suggestions based on your interests and fitness level.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Complete Insurance',
      description: 'Comprehensive coverage for peace of mind during your cycling adventures.'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Multi-Currency Support',
      description: 'Pay in your preferred currency with secure international payment processing.'
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

  const handleMoreDetails = (locationId: string) => {
    window.location.href = `/location/${locationId}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      
      <main>
        {/* ============================================= */}
        {/* Hero Section */}
        {/* ============================================= */}
        <section className="relative h-[100vh] min-h-[700px] overflow-hidden translate-y-[-65px]">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://res.cloudinary.com/di9vcyned/video/upload/f_auto,q_auto/v1755452159/Sri_lanka_Video_4_l3x1lu.jpg"
          >
            <source src="https://res.cloudinary.com/di9vcyned/video/upload/v1757962213/Landing_Page_Vid_avjzt8.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="w-full text-white space-y-8">
              {/* <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 hover:border-teal-400 hover:bg-teal-400/20 transition-all duration-300">
                <CheckCircle className="h-5 w-5 text-teal-300 mr-2" />
                <span className="text-sm font-medium">Trusted by 10,000+ travelers</span>
              </div> */}

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-lg">
                Explore
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent"> Sri Lanka</span>
                <br />
                Your Way
              </h1>
              
              <p className="text-lg text-gray-200 leading-relaxed max-w-xl drop-shadow-md">
                Discover the pearl of the Indian Ocean with our flexible bike rental network. 
                Pick up in one city, drop off in another, and explore at your own pace.
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-md pt-2">
                  <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-teal-400 flex-shrink-0" /><span>Island-wide pick-up</span></div>
                  <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-teal-400 flex-shrink-0" /><span>Safe & insured rides</span></div>
                  <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-teal-400 flex-shrink-0" /><span>24/7 Support</span></div>
                  <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-teal-400 flex-shrink-0" /><span>Eco-friendly travel</span></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  to="/booking"
                  className="bg-gradient-to-r from-[#1E90FF] to-teal-500 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-lg text-center"
                >
                  Start Your Journey
                </Link>
                <Link 
                  to="/locations"
                  className="border-2 border-white/60 text-white px-8 py-4 rounded-xl hover:border-teal-400 hover:bg-teal-400/20 transition-all duration-300 font-semibold text-lg backdrop-blur-sm text-center"
                >
                  View Destinations
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* How It Works Section */}
        {/* ============================================= */}
        
        <section className="py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Get started in three simple and straightforward steps to begin your Sri Lankan cycling adventure.
              </p>
            </div>

            <div className="space-y-24">
              {howItWorksSteps.map((item, index) => (
                <div
                  key={item.step}
                  className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Icon Section */}
                  <div className="flex-shrink-0 lg:w-1/2 flex justify-center">
                    <div className="relative group">
                      {/* Step Number - Floating */}
                      <div className="absolute -top-8 -left-8 z-10">
                        <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl`}>
                          {item.step}
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className="w-80 h-80 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <img 
                          src={item.icon} 
                          alt={item.title}
                          className="w-64 h-64 object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv) fallbackDiv.style.display = 'flex';
                          }}
                        />
                        {/* Fallback icon if SVG doesn't load */}
                        <div className={`hidden w-64 h-64 ${item.iconColor} items-center justify-center`}>
                          {index === 0 && <MapPin className="w-32 h-32" />}
                          {index === 1 && <Bike className="w-32 h-32" />}
                          {index === 2 && <CheckCircle className="w-32 h-32" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-1/2 text-center lg:text-left space-y-6">
                    <h3 className="text-4xl lg:text-5xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                      {item.desc}
                    </p>
                    
                    {/* Decorative Line */}
                    <div className={`w-24 h-1 bg-gradient-to-r ${item.color} mx-auto lg:mx-0 rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-24">
              <div className="inline-flex flex-col items-center space-y-8">
                <p className="text-2xl text-gray-600 font-medium">Ready to start your adventure?</p>
                <Link 
                  to="/booking" 
                  className="group inline-flex items-center gap-4 bg-gradient-to-r from-[#00D4AA] to-teal-400 text-white px-16 py-6 rounded-2xl hover:from-teal-400 hover:to-teal-500 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-2xl"
                >
                  <span>Book Your Bike Now</span>
                  <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* Locations Preview Section */}
        {/* ============================================= */}
        <section className="py-32 bg-gradient-to-br from-white via-blue-50 to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Explore Our Destinations
                    </h2>
                    <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Our partner network spans across Sri Lanka's most iconic and beautiful destinations, ready for your cycling adventure.
                    </p>
                    
                    {/* Decorative Line */}
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mt-8 rounded-full"></div>
                </div>

                {locationsLoading ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center space-x-3 text-gray-500 text-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span>Discovering amazing locations...</span>
                        </div>
                    </div>
                ) : locationsError ? (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl">
                            <div className="text-lg font-medium mb-2">Oops! Something went wrong</div>
                            <p className="text-sm">{locationsError}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                        {locations.slice(0, 6).map((location, index) => (
                            <div 
                                key={location.id} 
                                className="group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative">  
                                    <LocationCard location={location} onMoreDetails={handleMoreDetails} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                <div className="text-center mt-24">
                    <div className="inline-flex flex-col items-center space-y-8">
                        <p className="text-2xl text-gray-600 font-medium">Ready to explore more destinations?</p>
                        <Link 
                            to="/locations"
                            className="group inline-flex items-center gap-4 bg-gradient-to-r from-[#FF6B35] to-orange-500 text-white px-16 py-6 rounded-2xl hover:from-orange-500 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-2xl"
                        >
                            <span>View All Locations</span>
                            <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>


       {/* Package Plans */}
       {/* <section className="py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Flexible packages designed for every type of traveler, from day explorers to month-long adventurers
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {packages.map((pkg) => (
//               <div
//                 key={pkg.id}
//                 className={`relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 transform hover:scale-105 border-2 ${
//                   pkg.popular ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-gray-100 hover:border-emerald-200'
//                 }`}
//               >
//                 {pkg.popular && (
//                   <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                     <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
//                       Most Popular
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="text-center mb-8">
//                   <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
//                   <div className="flex items-center justify-center mb-4">
//                     <span className="text-5xl font-bold text-emerald-600">{pkg.price}</span>
//                     <span className="text-gray-500 ml-2">/ {pkg.duration}</span>
//                   </div>
//                 </div>

//                 <ul className="space-y-4 mb-8">
//                   {pkg.features.map((feature, index) => (
//                     <li key={index} className="flex items-center">
//                       <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
//                       <span className="text-gray-700">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 <Link
//                   to="/booking"
//                   className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 text-center block ${
//                     pkg.popular
//                       ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg'
//                       : 'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'
//                   }`}
//                 >
//                   Choose Plan
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section> */}



        {/* ============================================= */}
        {/* Features Section */}
        {/* ============================================= */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Cycle.LK</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the most tourist-friendly bike rental platform in Sri Lanka.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="bg-white rounded-2xl p-8 border-2 border-transparent shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(30,144,255,0.4)] hover:border-[conic-gradient(at_top,#1E90FF,#1E90FF)_1] min-h-[280px] flex flex-col">
                  <div className="text-[#1E90FF] mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* Testimonials Section */}
        {/* ============================================= */}
        <section 
        className="relative py-20 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url('https://res.cloudinary.com/di9vcyned/image/upload/v1755613350/bg-1_f7cw6v.jpg')` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 text-white">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">What Travelers Say</h2>
            <p className="text-xl max-w-3xl mx-auto drop-shadow">
              Join thousands of satisfied travelers who've explored Sri Lanka with Cycle.LK
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="
                  backdrop-blur-xl bg-white/10 border border-white/20
                  rounded-2xl p-8 shadow-lg text-white
                  transition transform hover:scale-105 hover:shadow-2xl hover:bg-white/30
                "
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-300 fill-current drop-shadow" />
                  ))}
                </div>
                <p className="mb-6 italic text-lg">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00D4AA] to-[#1E90FF] rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm opacity-80">{testimonial.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default HomePage;