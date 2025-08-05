import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { bikeService, Bike } from '../services/bikeService';
import { bookingService, CreateBookingRequest } from '../services/bookingService';
import {
  BookingProgressSteps,
  BikeSelectionStep,
  BookingDetailsStep,
  BookingConfirmationStep,
  BookingSummary,
  LoadingSpinner
} from '../components/BookingPage';

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

  // Only redirect to login when trying to complete booking (step 3) and not authenticated
  // Allow public users to browse bikes and see pricing in steps 1 and 2

  // Calculate total price based on selected bike and duration
  const calculateTotalPrice = () => {
    if (!selectedBike || !startDate || !endDate) return 0;
    
    const start = new Date(`${startDate}T${startTime || '00:00'}`);
    const end = new Date(`${endDate}T${endTime || '23:59'}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const days = Math.ceil(durationHours / 24);
    
    return days * selectedBike.pricing.perDay;
  };

  // Handle booking creation - redirect to login if not authenticated
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

      const response = await bookingService.createBooking(bookingPayload);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const steps = [
    { number: 1, title: 'Select Bike', description: 'Choose your preferred bike' },
    { number: 2, title: 'Booking Details', description: 'Set dates and delivery info' },
    { number: 3, title: 'Confirmation', description: 'Your booking is confirmed' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <BookingProgressSteps currentStep={currentStep} steps={steps} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Bike Selection */}
            {currentStep === 1 && (
              <BikeSelectionStep
                availableBikes={availableBikes}
                selectedBike={selectedBike}
                showFilters={showFilters}
                error={error}
                onBikeSelect={setSelectedBike}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onContinue={() => setCurrentStep(2)}
              />
            )}

            {/* Step 2: Booking Details */}
            {currentStep === 2 && selectedBike && (
              <BookingDetailsStep
                selectedBike={selectedBike}
                startDate={startDate}
                startTime={startTime}
                endDate={endDate}
                endTime={endTime}
                deliveryAddress={deliveryAddress}
                error={error}
                isBooking={isBooking}
                isAuthenticated={isAuthenticated}
                onStartDateChange={setStartDate}
                onStartTimeChange={setStartTime}
                onEndDateChange={setEndDate}
                onEndTimeChange={setEndTime}
                onDeliveryAddressChange={setDeliveryAddress}
                onBack={() => setCurrentStep(1)}
                onCreateBooking={handleCreateBooking}
              />
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <BookingConfirmationStep
                selectedBike={selectedBike}
                startDate={startDate}
                startTime={startTime}
                endDate={endDate}
                endTime={endTime}
                deliveryAddress={deliveryAddress}
                totalPrice={calculateTotalPrice()}
              />
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <BookingSummary
              selectedBike={selectedBike}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              deliveryAddress={deliveryAddress}
              totalPrice={calculateTotalPrice()}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;