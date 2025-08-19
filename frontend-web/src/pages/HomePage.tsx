{/* ============================================= */}
{/* New UI Version 1 - By Bhashitha */}
{/* ============================================= */}


// //frontend-web/pages/HomePage.tsx
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import { 
//   MapPin, 
//   Star, 
//   Bike, 
//   Navigation, 
//   Shield, 
//   Globe, 
//   CheckCircle,
//   Clock
// } from 'lucide-react';
// import { locationService, Location } from '../services/locationService';
// import LocationCard from '../components/LocationsPage/LocationCard';

// const HomePage = () => {

//   // const [selectedPackage, setSelectedPackage] = useState('week');
//   // const [showLocationDropdown, setShowLocationDropdown] = useState(false);
//   // const [selectedLocation, setSelectedLocation] = useState('Colombo');
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [locationsLoading, setLocationsLoading] = useState(false);
//   const [locationsError, setLocationsError] = useState<string | null>(null);
//   // const packages = [
//   //   {
//   //     id: 'day',
//   //     name: '1-Day Explorer',
//   //     price: '$15',
//   //     duration: '24 hours',
//   //     features: ['1 city coverage', 'Basic insurance', 'GPS tracking', 'Customer support'],
//   //     popular: false
//   //   },
//   //   {
//   //     id: 'week',
//   //     name: '1-Week Adventure',
//   //     price: '$89',
//   //     duration: '7 days',
//   //     features: ['3 cities coverage', 'Premium insurance', 'Route suggestions', '24/7 support'],
//   //     popular: true
//   //   },
//   //   {
//   //     id: 'month',
//   //     name: '1-Month Journey',
//   //     price: '$299',
//   //     duration: '30 days',
//   //     features: ['Unlimited coverage', 'Full insurance', 'Concierge service', 'Priority support'],
//   //     popular: false
//   //   }
//   // ];

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         setLocationsLoading(true);
//         const data = await locationService.getAllLocations();
//         setLocations(data);
//       } catch (err:any) {
//         setLocationsError(`Failed to load locations. ${err.message}`);
//       } finally {
//         setLocationsLoading(false);
//       }
//     };
//     fetchLocations();
//   }, []);

//   const features = [
//     {
//       icon: <MapPin className="h-8 w-8" />,
//       title: 'Multi-Location Network',
//       description: 'Pick up and drop off bikes at any of our 50+ partner locations across Sri Lanka'
//     },
//     {
//       icon: <Navigation className="h-8 w-8" />,
//       title: 'Smart Route Planning',
//       description: 'Get personalized route suggestions based on your interests and fitness level'
//     },
//     {
//       icon: <Shield className="h-8 w-8" />,
//       title: 'Complete Insurance',
//       description: 'Comprehensive coverage for peace of mind during your cycling adventures'
//     },
//     {
//       icon: <Globe className="h-8 w-8" />,
//       title: 'Multi-Currency Support',
//       description: 'Pay in your preferred currency with secure international payment processing'
//     }
//   ];

//   const testimonials = [
//     {
//       name: 'Sarah Johnson',
//       country: 'Australia',
//       rating: 5,
//       text: 'Amazing experience! Being able to cycle from Colombo to Kandy and drop off the bike there made our trip so much more flexible.',
//       avatar: 'SJ'
//     },
//     {
//       name: 'Marco Silva',
//       country: 'Brazil',
//       rating: 5,
//       text: 'The bikes were in excellent condition and the GPS tracking made me feel safe. Highly recommend for eco-conscious travelers!',
//       avatar: 'MS'
//     },
//     {
//       name: 'Emma Thompson',
//       country: 'UK',
//       rating: 5,
//       text: 'Perfect way to explore Sri Lanka\'s hidden gems. The route suggestions led us to breathtaking views we would have missed otherwise.',
//       avatar: 'ET'
//     }
//   ];

//   // Handler for LocationCard (no-op for View Bikes, navigate for More Details)
//   const handleMoreDetails = (locationId: string) => {
//     // You can use a navigation hook if needed, or just link to /location/:id
//     window.location.href = `/location/${locationId}`;
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Header />
      
//       {/* Hero Section */}
//         <section className="relative overflow-hidden h-[94vh]">
//         {/* Video Background */}
//         <video 
//           autoPlay 
//           loop 
//           muted 
//           playsInline
//           className="absolute inset-0 w-full h-full object-cover"
//         >
//           <source src="https://res.cloudinary.com/di9vcyned/video/upload/f_auto,q_auto/v1755452159/Sri_lanka_Video_4_l3x1lu.mp4" type="video/mp4" />
//         </video>
        
//         {/* Overlay for better text readability */}
//         <div className="absolute inset-0 bg-black/50"></div>
        
//         {/* Content Container - Centered Vertically */}
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
//           <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            
//             {/* Left Content Column */}
//             <div className="space-y-6 sm:space-y-8 text-white">
//               {/* Trust Badge */}
//               <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
//                 <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
//                 <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ travelers</span>
//               </div>

//               {/* Headline */}
//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
//                 Explore
//                 <span className="bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] bg-clip-text text-transparent drop-shadow-lg"> Sri Lanka</span>
//                 <br />
//                 Your Way
//               </h1>
              
//               {/* Intro Paragraph */}
//               <p className="text-lg text-gray-200 leading-relaxed max-w-lg drop-shadow-md">
//                 Discover the pearl of the Indian Ocean with our flexible bike rental network. 
//                 Pick up in one city, drop off in another, and explore at your own pace.
//               </p>

//               {/* Mini Feature List */}
//               <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-md pt-2">
//                   <div className="flex items-center gap-3">
//                       <MapPin className="h-5 w-5 text-emerald-400 flex-shrink-0" />
//                       <span>Island-wide pick-up</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                       <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0" />
//                       <span>Safe & insured rides</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                       <Clock className="h-5 w-5 text-emerald-400 flex-shrink-0" />
//                       <span>24/7 Support</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                       <Globe className="h-5 w-5 text-emerald-400 flex-shrink-0" />
//                       <span>Eco-friendly travel</span>
//                   </div>
//               </div>

//               {/* CTAs */}
//               <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
//                 <Link 
//                   to="/booking"
//                   className="bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] text-white px-8 py-4 rounded-xl hover:from-[#1873CC] hover:to-[#00B896] transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-lg text-center"
//                 >
//                   Start Your Journey
//                 </Link>
//                 <button className="border-2 border-white/60 text-white px-8 py-4 rounded-xl hover:border-[#00D4AA] hover:bg-[#00D4AA]/20 transition-all duration-300 font-semibold text-lg backdrop-blur-sm text-center">
//                   View Destinations
//                 </button>
//               </div>

//               {/* Extra note */}
//               <p className="text-sm text-gray-300 pt-2">
//                   🌍 Every trip supports local communities & sustainable tourism.
//               </p>
//             </div>

//             {/* Right Booking Widget Column (Commented Out) */}
//             {/* 
//             <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
//               <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Booking</h3>
              
//               <div className="space-y-6">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Pick-up Location</label>
//                   <button
//                     onClick={() => setShowLocationDropdown(!showLocationDropdown)}
//                     className="w-full flex items-center justify-between p-4 border border-gray-300 bg-white rounded-xl hover:border-emerald-500 transition-colors"
//                   >
//                     <div className="flex items-center">
//                       <MapPin className="h-5 w-5 text-emerald-500 mr-3" />
//                       <span className="text-gray-700">{selectedLocation}</span>
//                     </div>
//                     <ChevronDown className="h-5 w-5 text-gray-400" />
//                   </button>
                  
//                   {showLocationDropdown && (
//                     <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
//                       {locations.map((location) => (
//                         <button
//                           key={location.name}
//                           onClick={() => {
//                             setSelectedLocation(location.name);
//                             setShowLocationDropdown(false);
//                           }}
//                           className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between first:rounded-t-xl last:rounded-b-xl"
//                         >
//                           <span className="text-gray-700">{location.name}</span>
//                           <span className="text-sm text-emerald-600">{location.bikes} Bikes</span>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                     <div className="relative">
//                       <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         type="date"
//                         className="w-full pl-12 pr-4 py-4 border border-gray-300 bg-white rounded-xl hover:border-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
//                     <div className="relative">
//                       <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <select className="w-full pl-12 pr-4 py-4 border border-gray-300 bg-white rounded-xl hover:border-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors appearance-none">
//                         <option>1 Day</option>
//                         <option>1 Week</option>
//                         <option>1 Month</option>
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>
//                 </div>

//                 <Link 
//                   to="/booking"
//                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg text-center block"
//                 >
//                   Search Available Bikes
//                 </Link>

//                 <div className="flex items-center justify-center text-sm text-gray-600">
//                   <ShieldCheck className="h-4 w-4 mr-2 text-gray-500" />
//                   Free cancellation up to 24 hours before
//                 </div>
//               </div>
//             </div> 
//             */}
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-emerald-50 relative overflow-hidden">
//         {/* Background decorative elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
//           <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           {/* Header */}
//           <div className="text-center mb-20">
//             <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
//               How{' '}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E90FF] to-[#00D4AA]">
//                 Cycle.LK
//               </span>{' '}
//               Works
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//               Experience the freedom of flexible bike rentals across Sri Lanka's most beautiful destinations
//             </p>
//           </div>

//           {/* Steps */}
//           <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
//             {[
//               { 
//                 step: '01', 
//                 title: 'Pick Location', 
//                 desc: 'Choose from 50+ partner locations across Sri Lanka for ultimate convenience', 
//                 icon: <MapPin className="h-10 w-10" />,
//                 gradient: 'from-[#1E90FF] to-[#00BFFF]'
//               },
//               { 
//                 step: '02', 
//                 title: 'Start Cycling', 
//                 desc: 'Unlock your bike instantly with QR code and begin your adventure', 
//                 icon: <Bike className="h-10 w-10" />,
//                 gradient: 'from-[#32CD32] to-[#228B22]'
//               },
//               { 
//                 step: '03', 
//                 title: 'Drop Anywhere', 
//                 desc: 'Return your bike at any partner location within your network area', 
//                 icon: <CheckCircle className="h-10 w-10" />,
//                 gradient: 'from-[#FF7F50] to-[#FF6347]'
//               }
//             ].map((item, index) => (
//               <div key={index} className="group cursor-pointer">
//                 {/* Connecting line for desktop */}
//                 {index < 2 && (
//                   <div className="hidden md:block absolute top-32 w-24 h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform translate-x-full translate-y-1/2 z-0" 
//                       style={{ left: `${(index + 1) * 33.33 - 8}%` }}>
//                   </div>
//                 )}
                
//                 <div className="relative z-10 text-center h-full">
//                   {/* Glass card */}
//                   <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:bg-white/60 group-hover:scale-105 group-hover:-translate-y-2 h-full flex flex-col">
                    
//                     {/* Step number badge */}
//                     <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                       <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
//                         {item.step}
//                       </div>
//                     </div>

//                     {/* Icon container */}
//                     <div className="mb-6 mt-4 flex-shrink-0">
//                       <div className={`w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}>
//                         <div className="transform group-hover:scale-110 transition-transform duration-300">
//                           {item.icon}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Content */}
//                     <div className="flex-grow flex flex-col justify-center">
//                       <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
//                         {item.title}
//                       </h3>
//                       <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
//                         {item.desc}
//                       </p>
//                     </div>

//                     {/* Hover glow effect */}
//                     <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Call to action */}
//           <div className="text-center mt-16">
//             <Link to="/booking" className="inline-block">
//               <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-lg rounded-full px-8 py-4 border border-white/30 shadow-lg hover:shadow-xl hover:bg-white/70 transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95">
//                 <span className="text-gray-800 font-semibold">Ready to start cycling?</span>
//                 <div className="w-6 h-6 bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
//                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </div>
//               </div>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Package Plans */}
//       {/* <section className="py-20">
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

//       {/* Features */}
//       <section className="py-20 bg-gradient-to-br from-[#ffffff] to-[#ffffff] relative overflow-hidden">
//         {/* Background decorative blobs */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
//           <div className="absolute bottom-0 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Cycle.LK</h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Experience the most advanced and tourist-friendly bike rental platform in Sri Lanka
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => (
//               <div key={index} className="group relative">
//                 <div className="bg-white rounded-2xl p-8 border-2 border-transparent shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(16,185,129,0.4)] hover:border-[conic-gradient(at_top,_#10B981,_#14B8A6)] min-h-[280px] flex flex-col">
                  
//                   {/* Icon with hover animation */}
//                   <div className="text-emerald-500 mb-4 transition-transform duration-300 group-hover:scale-110">
//                     {feature.icon}
//                   </div>
                  
//                   <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300">
//                     {feature.title}
//                   </h3>
//                   <p className="text-gray-600 transition-colors duration-300">
//                     {feature.description}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Locations Preview */}
//       <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-emerald-50 relative overflow-hidden">
//         {/* Background decorative elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
//           <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           {/* Header */}
//           <div className="text-center mb-20">
//             <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
//               Explore{' '}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7F50] to-[#FF6347]">
//                 Beautiful Destinations
//               </span>
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//               Our partner network spans across Sri Lanka's most iconic destinations
//             </p>
//           </div>

//           {/* Locations grid */}
//           {locationsLoading ? (
//             <div className="text-center py-12 text-gray-500">Loading locations...</div>
//           ) : locationsError ? (
//             <div className="text-center py-12 text-red-500">{locationsError}</div>
//           ) : (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
//               {locations.slice(0, 6).map((location) => (
//                 <div key={location.id} className="group relative">
//                   {/* Hover effect container */}
//                   <div className="transition-all duration-300 transform rounded-2xl group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_12px_40px_rgba(255,107,80,0.4)]">
//                     <LocationCard location={location} onMoreDetails={handleMoreDetails} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* CTA */}
//           <div className="text-center mt-16">
//             <Link to="/locations" className="inline-block">
//               <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-lg rounded-full px-8 py-4 border border-white/30 shadow-lg hover:shadow-xl hover:bg-white/70 transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95">
//                 <span className="text-gray-800 font-semibold text-lg">View All Locations</span>
//                 <div className="w-6 h-6 bg-gradient-to-r from-[#FF7F50] to-[#FF6347] rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
//                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </div>
//               </div>
//             </Link>
//           </div>
//         </div>
//       </section>


//       {/* Testimonials */}
//       <section 
//         className="relative py-20 bg-cover bg-center bg-no-repeat" 
//         style={{ backgroundImage: `url('https://res.cloudinary.com/di9vcyned/image/upload/v1755613350/bg-1_f7cw6v.jpg')` }}
//       >
//         {/* Overlay */}
//         <div className="absolute inset-0 bg-black/40"></div>

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16 text-white">
//             <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">What Travelers Say</h2>
//             <p className="text-xl max-w-3xl mx-auto drop-shadow">
//               Join thousands of satisfied travelers who've explored Sri Lanka with Cycle.LK
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <div 
//                 key={index} 
//                 className="
//                   backdrop-blur-xl bg-white/20 border border-white/30 
//                   rounded-2xl p-8 shadow-lg text-white
//                   transition transform hover:scale-105 hover:shadow-2xl hover:bg-white/30
//                 "
//               >
//                 <div className="flex items-center mb-4">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Star key={i} className="h-5 w-5 text-yellow-300 fill-current drop-shadow" />
//                   ))}
//                 </div>
//                 <p className="mb-6 italic text-lg">"{testimonial.text}"</p>
//                 <div className="flex items-center">
//                   <div className="w-12 h-12 bg-gradient-to-br from-[#00D4AA] to-[#1E90FF] rounded-full flex items-center justify-center text-white font-semibold">
//                     {testimonial.avatar}
//                   </div>
//                   <div className="ml-4">
//                     <div className="font-semibold">{testimonial.name}</div>
//                     <div className="text-sm opacity-80">{testimonial.country}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// };

// export default HomePage;















{/* ============================================= */}
{/* New UI Version 2 - By Bhashitha */}
{/* ============================================= */}




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
      } catch (err:any) {
        setLocationsError(`Failed to load locations. ${err.message}`);
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
      desc: 'Choose from 50+ partner locations across Sri Lanka for ultimate convenience.', 
      icon: <MapPin className="h-10 w-10" />
    },
    { 
      step: '02', 
      title: 'Start Cycling', 
      desc: 'Unlock your bike instantly with our app and begin your adventure.', 
      icon: <Bike className="h-10 w-10" />
    },
    { 
      step: '03', 
      title: 'Drop Anywhere', 
      desc: 'Return your bike at any partner location within your network area.', 
      icon: <CheckCircle className="h-10 w-10" />
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
      <Header />
      
      <main>
        {/* ============================================= */}
        {/* Hero Section */}
        {/* ============================================= */}
        <section className="relative h-[95vh] min-h-[700px] overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://res.cloudinary.com/di9vcyned/video/upload/f_auto,q_auto/v1755452159/Sri_lanka_Video_4_l3x1lu.jpg"
          >
            <source src="https://res.cloudinary.com/di9vcyned/video/upload/f_auto,q_auto/v1755452159/Sri_lanka_Video_4_l3x1lu.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="w-full text-white space-y-8">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/30">
                <CheckCircle className="h-5 w-5 text-teal-300 mr-2" />
                <span className="text-sm font-medium">Trusted by 10,000+ travelers</span>
              </div>

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
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-lg text-center"
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
        
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in three simple and straightforward steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {howItWorksSteps.map((item) => (
                <div key={item.step} className="group text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-teal-500 hover:-translate-y-2 transition-all duration-300">
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                      {item.icon}
                    </div>
                  </div>
                  <span className="font-bold text-blue-600 mb-2 block">{item.step}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link 
                to="/booking" 
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                <span>Book Your Bike Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* Locations Preview Section */}
        {/* ============================================= */}
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Explore Our Destinations
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our partner network spans across Sri Lanka's most iconic and beautiful destinations.
                    </p>
                </div>

                {locationsLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading locations...</div>
                ) : locationsError ? (
                    <div className="text-center py-12 text-red-600 bg-red-50 p-6 rounded-lg">{locationsError}</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {locations.slice(0, 6).map((location) => (
                        <div key={location.id} className="group">
                        <div className="transition-all duration-300 transform rounded-2xl group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-2xl">
                            <LocationCard location={location} onMoreDetails={handleMoreDetails} />
                        </div>
                        </div>
                    ))}
                    </div>
                )}

                <div className="text-center mt-16">
                    <Link 
                    to="/locations"
                    className="inline-flex items-center gap-3 border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-xl hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] transition-colors duration-300 font-semibold text-lg transform hover:scale-105"
                    >
                    <span>View All Locations</span>
                    <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </section>

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
                <div key={feature.title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl hover:border-teal-500 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                  <div className="text-teal-500 mb-4">{feature.icon}</div>
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
                  backdrop-blur-xl bg-white/20 border border-white/30 
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