import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bike, 
  Shield, 
  ChevronDown,
  CheckCircle,
  CreditCard,
  ArrowRight,
  Star,
  Filter,
  Search
} from 'lucide-react';

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('week');
  const [selectedBike, setSelectedBike] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const packages = [
    {
      id: 'day',
      name: '1-Day Explorer',
      price: 15,
      duration: '24 hours',
      features: ['1 city coverage', 'Basic insurance', 'GPS tracking'],
      popular: false
    },
    {
      id: 'week',
      name: '1-Week Adventure',
      price: 89,
      duration: '7 days',
      features: ['3 cities coverage', 'Premium insurance', 'Route suggestions'],
      popular: true
    },
    {
      id: 'month',
      name: '1-Month Journey',
      price: 299,
      duration: '30 days',
      features: ['Unlimited coverage', 'Full insurance', 'Concierge service'],
      popular: false
    }
  ];

  const availableBikes = [
    {
      id: 1,
      name: 'City Cruiser',
      type: 'Hybrid',
      rating: 4.8,
      reviews: 124,
      features: ['Comfortable seat', 'Basket included', 'LED lights'],
      price: 15,
      location: 'Colombo Central',
      image: 'Modern hybrid bike with basket'
    },
    {
      id: 2,
      name: 'Mountain Explorer',
      type: 'Mountain Bike',
      rating: 4.9,
      reviews: 89,
      features: ['21-speed gears', 'Shock absorbers', 'All-terrain tires'],
      price: 20,
      location: 'Kandy Hills',
      image: 'Rugged mountain bike'
    },
    {
      id: 3,
      name: 'Beach Rider',
      type: 'Beach Cruiser',
      rating: 4.7,
      reviews: 156,
      features: ['Wide tires', 'Rust-resistant', 'Cup holder'],
      price: 12,
      location: 'Galle Fort',
      image: 'Classic beach cruiser'
    }
  ];

  const steps = [
    { number: 1, title: 'Select Package', description: 'Choose your rental duration' },
    { number: 2, title: 'Pick Bike', description: 'Select your preferred bike' },
    { number: 3, title: 'Payment', description: 'Complete your booking' },
    { number: 4, title: 'Confirmation', description: 'Get your booking details' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Progress Steps */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="h-6 w-6" /> : step.number}
                  </div>
                  <div className="ml-3">
                    <div className={`font-medium ${currentStep >= step.number ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-8 ${
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Package Selection */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Package</h2>
                  <p className="text-gray-600">Select the rental duration that best fits your travel plans</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                        selectedPackage === pkg.id 
                          ? 'border-emerald-500 ring-4 ring-emerald-100 transform scale-105' 
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                        <div className="text-3xl font-bold text-emerald-600 mb-4">${pkg.price}</div>
                        <div className="text-gray-500 mb-6">{pkg.duration}</div>
                        
                        <ul className="space-y-2 text-sm text-gray-600">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center"
                  >
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Bike Selection */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Bike</h2>
                    <p className="text-gray-600">Select from our available bikes in your chosen location</p>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors"
                  >
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </button>
                </div>

                {showFilters && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bike Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>All Types</option>
                          <option>Hybrid</option>
                          <option>Mountain</option>
                          <option>Beach Cruiser</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>Any Price</option>
                          <option>$10-15</option>
                          <option>$15-20</option>
                          <option>$20+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>Any Rating</option>
                          <option>4.5+ Stars</option>
                          <option>4.0+ Stars</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>All Locations</option>
                          <option>Colombo</option>
                          <option>Kandy</option>
                          <option>Galle</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {availableBikes.map((bike) => (
                    <div
                      key={bike.id}
                      onClick={() => setSelectedBike(bike.id)}
                      className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                        selectedBike === bike.id 
                          ? 'border-emerald-500 ring-4 ring-emerald-100' 
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <Bike className="h-16 w-16 text-gray-400" />
                        <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                          {bike.image}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
                          <div className="text-lg font-bold text-emerald-600">${bike.price}/day</div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{bike.rating} ({bike.reviews})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{bike.location}</span>
                        </div>
                        
                        <ul className="space-y-1">
                          {bike.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-emerald-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-emerald-500 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedBike}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Details</h2>
                  <p className="text-gray-600">Complete your booking with secure payment</p>
                </div>

                <div className="bg-white rounded-2xl p-8">
                  <form className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                            placeholder="Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                            placeholder="+94 77 123 4567"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-300 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <input type="radio" name="payment" id="card" className="mr-3" defaultChecked />
                            <label htmlFor="card" className="font-medium">Credit/Debit Card</label>
                            <CreditCard className="h-5 w-5 ml-auto text-gray-400" />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-emerald-500 mr-2" />
                        <span className="text-sm text-gray-600">Your payment information is secure and encrypted</span>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-emerald-500 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center"
                  >
                    Complete Booking
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                  <p className="text-gray-600">Your bike rental has been successfully booked. Check your email for details.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">#CL2025001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-semibold">1-Week Adventure</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bike:</span>
                      <span className="font-semibold">City Cruiser</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pick-up Location:</span>
                      <span className="font-semibold">Colombo Central</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-semibold">March 15, 2025</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/dashboard"
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold"
                  >
                    View Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-emerald-500 transition-colors font-semibold"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold">
                    {packages.find(p => p.id === selectedPackage)?.name || 'Not selected'}
                  </span>
                </div>
                
                {selectedBike && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bike:</span>
                    <span className="font-semibold">
                      {availableBikes.find(b => b.id === selectedBike)?.name}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">7 days</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Pick-up:</span>
                  <span className="font-semibold">Colombo Central</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package fee:</span>
                    <span>$89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance:</span>
                    <span>$15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee:</span>
                    <span>$5</span>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">$109</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center text-emerald-700">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Free cancellation up to 24 hours before pickup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;