import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { bikeService, Bike, BikeType } from '../services/bikeService';
import { bookingService, CreateBookingRequest } from '../services/bookingService';
import { Location } from '../services/locationService';
import { Partner, partnerService } from '../services/partnerService';
import {
  BookingProgressSteps,
  BikeSelectionStep,
  LocationSelectionStep,
  RentalPeriodStep,
  DropoffSelectionStep,
  FinalConfirmationStep,
  LoadingSpinner
} from '../components/BookingPage';
import { Button } from '../ui';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Booking form data
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Steps configuration
  const steps = [
    { number: 1, title: 'Select Locations', description: 'Choose pickup and drop-off points' },
    { number: 2, title: 'Choose Bike', description: 'Select your preferred bike' },
    { number: 3, title: 'Rental Period', description: 'Set dates and delivery info' },
    { number: 4, title: 'Drop-off Location', description: 'Select partner for drop-off' },
    { number: 5, title: 'Confirmation', description: 'Review and confirm booking' }
  ];

  // Fetch bikes when locations are selected
  useEffect(() => {
    if (currentStep === 2 && pickupLocation) {
      const fetchBikes = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log(`Fetching bikes for location: ${pickupLocation.id}`);
          // Use the new optimized method to get available bikes for the pickup location
          const bikes = await bikeService.getAvailableBikesForLocation(pickupLocation.id, {
            sort: 'rating' // Default to highest rated bikes first
          });
          console.log("bikes", bikes);
          setAvailableBikes(bikes);
          
          if (bikes.length === 0) {
            setError('No bikes are currently available at this location. Please try a different location.');
          }
        } catch (err) {
          setError('Failed to load available bikes');
          console.error('Error fetching bikes:', err);
          setAvailableBikes([]);
        } finally {
          setLoading(false);
        }
      };

      fetchBikes();
    }
  }, [currentStep, pickupLocation]);

  // Countdown effect for success page
  useEffect(() => {
    if (bookingSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (bookingSuccess && countdown === 0) {
      navigate('/dashboard');
    }
  }, [bookingSuccess, countdown, navigate]);

  // Show no bikes available page if no bikes found
  if(availableBikes.length === 0 && currentStep === 2 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Progress Steps */}
        <BookingProgressSteps currentStep={currentStep} steps={steps} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 mb-8">
              <svg className="h-12 w-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Main Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Bikes Available
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Unfortunately, there are no bikes available at <span className="font-semibold text-emerald-600">{pickupLocation?.name}</span> for your selected dates. 
              Don't worry, we have other options for you!
            </p>

            {/* Suggestions */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">What you can do:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm font-semibold">1</span>
                  </div>
                  <p className="text-gray-700">Try selecting a different pickup location nearby</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm font-semibold">2</span>
                  </div>
                  <p className="text-gray-700">Check availability for different dates or times</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm font-semibold">3</span>
                  </div>
                  <p className="text-gray-700">Contact our support team for assistance finding alternatives</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                onClick={() => setCurrentStep(1)}
                className="px-8 py-3 text-lg"
              >
                Choose Different Location
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/locations')}
                className="px-8 py-3 text-lg"
              >
                View All Locations
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/support')}
                className="px-8 py-3 text-lg"
              >
                Contact Support
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                New bikes are added regularly. Try checking back later or 
                <a href="/support" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">contact us</a> 
                for updates on availability.
              </p>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  // Calculate total price based on selected bike and duration
  const calculateTotalPrice = () => {
    if (!selectedBike || !startDate || !endDate) return 0;
    
    const start = new Date(`${startDate}T${startTime || '00:00'}`);
    const end = new Date(`${endDate}T${endTime || '23:59'}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const days = Math.ceil(durationHours / 24);
    
    let total = days * selectedBike.pricing.perDay;
    
    // Add delivery fee if there's a custom delivery address
    if (deliveryAddress && selectedBike.pricing.deliveryFee) {
      total += selectedBike.pricing.deliveryFee;
    }
    
    return total;
  };

  // Handle location selection (Step 1)
  const handleLocationSelect = (pickup: Location, dropoff: Location) => {
    setPickupLocation(pickup);
    setDropoffLocation(dropoff);
    setCurrentStep(2);
  };

  // Handle bike selection (Step 2)
  const handleBikeSelect = (bike: Bike) => {
    setSelectedBike(bike);
    setCurrentStep(3);
  };

  // Refresh bikes with filters
  const refreshBikesWithFilters = async (filters?: {
    type?: BikeType;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price-asc' | 'price-desc' | 'rating';
  }) => {
    if (!pickupLocation) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const bikes = await bikeService.getAvailableBikesForLocation(pickupLocation.id, filters);
      setAvailableBikes(bikes);
      
      if (bikes.length === 0) {
        setError('No bikes match your current filters. Try adjusting your criteria.');
      }
    } catch (err) {
      setError('Failed to load bikes with selected filters');
      console.error('Error fetching filtered bikes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle rental period selection (Step 3)
  const handleRentalPeriodSelect = (rentalData: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    deliveryAddress: string;
  }) => {
    setStartDate(rentalData.startDate);
    setStartTime(rentalData.startTime);
    setEndDate(rentalData.endDate);
    setEndTime(rentalData.endTime);
    setDeliveryAddress(rentalData.deliveryAddress);
    setCurrentStep(4);
  };

  // Handle dropoff selection (Step 4)
  const handleDropoffSelection = async (selectedPartnerId: string) => {
    try {
      // Fetch the selected partner details
      const partner = await partnerService.getPartnerById(selectedPartnerId);
      setSelectedPartner(partner);
      setCurrentStep(5);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      setError('Failed to load partner details');
    }
  };

  // Handle final booking confirmation (Step 5)
  const handleCreateBooking = async () => {
    // Check if user is authenticated before proceeding with booking
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedBike || !startDate || !endDate || !user || !selectedPartner) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsBooking(true);
      setError(null);

      const startDateTime = `${startDate}T${startTime || '09:00'}:00.000Z`;
      const endDateTime = `${endDate}T${endTime || '18:00'}:00.000Z`;

      const bookingPayload: CreateBookingRequest = {
        bikeId: selectedBike.id,
        startTime: startDateTime,
        endTime: endDateTime,
        deliveryAddress: deliveryAddress || undefined,
        pickupLocation: pickupLocation?.name || undefined,
        dropoffLocation: `${selectedPartner.companyName} - ${selectedPartner.address || selectedPartner.mapLocation?.address || dropoffLocation?.name || 'Address not available'}`
      };

      const response = await bookingService.createBooking(bookingPayload);
      if(!response) {
        throw new Error('Booking creation failed');
      } else {
        // Booking created successfully
        console.log('Booking created:', response);
        setBookingSuccess(true);
        setCountdown(5); // Reset countdown
      }
    
      
      
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

  

  // Show loading spinner only when fetching bikes
  if (loading && currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  // If booking is successful, show success page
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-8">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your bike rental has been successfully booked. Get ready for an amazing cycling experience!
            </p>

            {/* Booking Details Summary */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Bike:</span>
                  <span className="font-medium text-gray-900">{selectedBike?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup:</span>
                  <span className="font-medium text-gray-900">{pickupLocation?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drop-off:</span>
                  <span className="font-medium text-gray-900">{dropoffLocation?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-medium text-gray-900">{new Date(`${startDate}T${startTime}`).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>End Date:</span>
                  <span className="font-medium text-gray-900">{new Date(`${endDate}T${endTime}`).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-3">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-blue-600">LKR {calculateTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="primary" 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 text-lg"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setBookingSuccess(false);
                  setCurrentStep(1);
                  setSelectedBike(null);
                  setPickupLocation(null);
                  setDropoffLocation(null);
                  setSelectedPartner(null);
                  setStartDate('');
                  setEndDate('');
                  setDeliveryAddress('');
                }}
                className="px-8 py-3 text-lg"
              >
                Book Another Bike
              </Button>
            </div>

            {/* Countdown */}
            <div className="text-gray-500 text-sm">
              <p>Automatically redirecting to dashboard in <span className="font-semibold text-blue-600">{countdown}</span> seconds...</p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Only show progress steps after step 1 */}
      {currentStep > 1 && (
        <BookingProgressSteps currentStep={currentStep} steps={steps} />
      )}

      <div className="pb-12">
        {/* Step 1: Location Selection */}
        {currentStep === 1 && (
          <LocationSelectionStep
            onLocationSelect={handleLocationSelect}
          />
        )}

        {/* Step 2: Bike Selection */}
        {currentStep === 2 && pickupLocation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BikeSelectionStep
              availableBikes={availableBikes}
              selectedBike={selectedBike}
              showFilters={showFilters}
              error={error}
              loading={loading}
              onBikeSelect={setSelectedBike}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onApplyFilters={refreshBikesWithFilters}
              onContinue={() => selectedBike && handleBikeSelect(selectedBike)}
            />
          </div>
        )}

        {/* Step 3: Rental Period Selection */}
        {currentStep === 3 && selectedBike && pickupLocation && dropoffLocation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RentalPeriodStep
              selectedBike={selectedBike}
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              onBack={() => setCurrentStep(2)}
              onContinue={handleRentalPeriodSelect}
            />
          </div>
        )}

        {/* Step 4: Dropoff Selection */}
        {currentStep === 4 && selectedBike && pickupLocation && dropoffLocation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DropoffSelectionStep
              selectedBike={selectedBike}
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              deliveryAddress={deliveryAddress}
              onBack={() => setCurrentStep(3)}
              onContinue={handleDropoffSelection}
            />
          </div>
        )}

        {/* Step 5: Final Confirmation */}
        {currentStep === 5 && selectedBike && pickupLocation && dropoffLocation && selectedPartner && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FinalConfirmationStep
              selectedBike={selectedBike}
              pickupLocation={pickupLocation}
              selectedPartner={selectedPartner}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              deliveryAddress={deliveryAddress}
              totalPrice={calculateTotalPrice()}
              onBack={() => setCurrentStep(4)}
              onConfirmBooking={handleCreateBooking}
              isBooking={isBooking}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;