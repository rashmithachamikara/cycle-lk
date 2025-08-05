import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { bikeService, Bike } from '../services/bikeService';
import { bookingService, BookingData } from '../services/bookingService';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bike as BikeIcon, 
  Shield, 
  ChevronDown,
  CheckCircle,
  ArrowRight,
  Star,
  Filter,
  AlertCircle
} from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Booking form data
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Fetch bikes on component mount
  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const bikes = await bikeService.getAllBikes({ available: true });
        setAvailableBikes(bikes);
      } catch (err) {
        setError('Failed to load available bikes');
        console.error('Error fetching bikes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Calculate total price based on selected bike and duration
  const calculateTotalPrice = () => {
    if (!selectedBike || !startDate || !endDate) return 0;
    
    const start = new Date(`${startDate}T${startTime || '00:00'}`);
    const end = new Date(`${endDate}T${endTime || '23:59'}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const days = Math.ceil(durationHours / 24);
    
    return days * selectedBike.pricing.perDay;
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!selectedBike || !startDate || !endDate || !user) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsBooking(true);
      setError(null);

      const startDateTime = `${startDate}T${startTime || '09:00'}:00.000Z`;
      const endDateTime = `${endDate}T${endTime || '18:00'}:00.000Z`;

      const bookingPayload: BookingData = {
        bikeId: selectedBike.id,
        startTime: startDateTime,
        endTime: endDateTime,
        deliveryAddress: deliveryAddress || undefined
      };

      await bookingService.createBooking(bookingPayload);
      setCurrentStep(3); // Move to confirmation step
      
    } catch (err: unknown) {
      let errorMessage = 'Failed to create booking';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Booking error:', err);
    } finally {
      setIsBooking(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available bikes...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Select Bike', description: 'Choose your preferred bike' },
    { number: 2, title: 'Booking Details', description: 'Set dates and delivery info' },
    { number: 3, title: 'Confirmation', description: 'Your booking is confirmed' }
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
            {/* Step 1: Bike Selection */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Bike</h2>
                    <p className="text-gray-600">Select from our available bikes for your journey</p>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors"
                  >
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {showFilters && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bike Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>All Types</option>
                          <option>city</option>
                          <option>mountain</option>
                          <option>hybrid</option>
                          <option>electric</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>Any Price</option>
                          <option>$10-20</option>
                          <option>$20-30</option>
                          <option>$30+</option>
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
                      onClick={() => setSelectedBike(bike)}
                      className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                        selectedBike?.id === bike.id 
                          ? 'border-emerald-500 ring-4 ring-emerald-100' 
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <BikeIcon className="h-16 w-16 text-gray-400" />
                        {bike.images && bike.images.length > 0 && (
                          <img 
                            src={bike.images[0].url} 
                            alt={bike.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
                          <div className="text-lg font-bold text-emerald-600">${bike.pricing.perDay}/day</div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">{bike.type}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{bike.rating || 0} ({bike.reviews?.length || 0})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{bike.location}</span>
                        </div>
                        
                        {bike.features && bike.features.length > 0 && (
                          <ul className="space-y-1">
                            {bike.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-3 w-3 text-emerald-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedBike}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Booking Details */}
            {currentStep === 2 && selectedBike && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Details</h2>
                  <p className="text-gray-600">Set your rental dates and delivery preferences</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-8">
                  <form className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Period</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery (Optional)</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                          placeholder="Enter your delivery address (optional - leave blank for pickup)"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-emerald-500 mr-2" />
                        <span className="text-sm text-gray-600">Free cancellation up to 24 hours before pickup</span>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-emerald-500 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    disabled={!startDate || !endDate || isBooking}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Creating Booking...' : 'Create Booking'}
                    {!isBooking && <ArrowRight className="h-5 w-5 ml-2" />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                  <p className="text-gray-600">Your bike rental has been successfully booked. Check your dashboard for details.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bike:</span>
                      <span className="font-semibold">{selectedBike?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{selectedBike?.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-semibold">{startDate} {startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-semibold">{endDate} {endTime}</span>
                    </div>
                    {deliveryAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-semibold">Yes</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-semibold text-emerald-600">${calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/dashboard"
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-center"
                  >
                    View Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-emerald-500 transition-colors font-semibold text-center"
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
                {selectedBike ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bike:</span>
                      <span className="font-semibold">{selectedBike.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold capitalize">{selectedBike.type}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{selectedBike.location}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-semibold">${selectedBike.pricing.perDay}/day</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Select a bike to see details
                  </div>
                )}
                
                {startDate && endDate && (
                  <>
                    <hr className="my-4" />
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start:</span>
                      <span className="font-semibold">{startDate} {startTime}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">End:</span>
                      <span className="font-semibold">{endDate} {endTime}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">
                        {Math.ceil((new Date(`${endDate}T${endTime || '23:59'}`).getTime() - new Date(`${startDate}T${startTime || '00:00'}`).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    
                    {deliveryAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-semibold">Included</span>
                      </div>
                    )}
                    
                    <hr className="my-4" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-emerald-600">${calculateTotalPrice()}</span>
                    </div>
                  </>
                )}
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