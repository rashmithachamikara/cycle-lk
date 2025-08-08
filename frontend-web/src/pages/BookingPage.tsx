import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { bikeService, Bike } from '../services/bikeService';
import { bookingService, CreateBookingRequest } from '../services/bookingService';
import { Location } from '../services/locationService';
import {
  BookingProgressSteps,
  BikeSelectionStep,
  LocationSelectionStep,
  RentalPeriodStep,
  FinalConfirmationStep,
  LoadingSpinner
} from '../components/BookingPage';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [availableBikes, setAvailableBikes] = useState<Bike[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Booking form data
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Fetch bikes when locations are selected
  useEffect(() => {
    if (currentStep === 2 && pickupLocation) {
      const fetchBikes = async () => {
        try {
          setLoading(true);
          const bikes = await bikeService.getAllBikes({ 
            available: true,
            location: pickupLocation.name
          });
          setAvailableBikes(bikes);
        } catch (err) {
          setError('Failed to load available bikes');
          console.error('Error fetching bikes:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchBikes();
    }
  }, [currentStep, pickupLocation]);

  // Show no bikes available message if no bikes found
 if(availableBikes.length === 0 && currentStep === 2) {
  return (
    <div className="min-h-screen bg-gray-50">
     <Header />
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         <h2 className="text-center text-lg font-semibold mt-10">
           No bikes available today at this location
         </h2>
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

  // Handle final booking confirmation (Step 4)
  const handleCreateBooking = async () => {
    // Check if user is authenticated before proceeding with booking
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedBike || !startDate || !endDate || !user) {
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
        deliveryAddress: deliveryAddress || undefined
      };

      await bookingService.createBooking(bookingPayload);
      
      // Navigate to booking confirmation or dashboard
      navigate('/dashboard');
      
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

  const steps = [
    { number: 1, title: 'Select Locations', description: 'Choose pickup and drop-off points' },
    { number: 2, title: 'Choose Bike', description: 'Select your preferred bike' },
    { number: 3, title: 'Rental Period', description: 'Set dates and delivery info' },
    { number: 4, title: 'Confirmation', description: 'Review and confirm booking' }
  ];

  

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Only show progress steps after step 1 */}
      {currentStep > 1 && (
        <BookingProgressSteps currentStep={currentStep} steps={steps} />
      )}

      <div className="py-12">
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
              onBikeSelect={setSelectedBike}
              onToggleFilters={() => setShowFilters(!showFilters)}
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

        {/* Step 4: Final Confirmation */}
        {currentStep === 4 && selectedBike && pickupLocation && dropoffLocation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FinalConfirmationStep
              selectedBike={selectedBike}
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              deliveryAddress={deliveryAddress}
              totalPrice={calculateTotalPrice()}
              onBack={() => setCurrentStep(3)}
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