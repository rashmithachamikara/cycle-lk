import { ArrowRight } from 'lucide-react';
import { Bike } from '../../services/bikeService';
import BookingDetailsForm from './BookingDetailsForm';
import ErrorAlert from './ErrorAlert';

interface BookingDetailsStepProps {
  selectedBike: Bike;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress: string;
  error: string | null;
  isBooking: boolean;
  isAuthenticated: boolean;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  onDeliveryAddressChange: (address: string) => void;
  onBack: () => void;
  onCreateBooking: () => void;
}

const BookingDetailsStep = ({
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  error,
  isBooking,
  isAuthenticated,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onDeliveryAddressChange,
  onBack,
  onCreateBooking
}: BookingDetailsStepProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Details</h2>
        <p className="text-gray-600">Set your rental dates and delivery preferences</p>
        {/* {!isAuthenticated && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> You can browse and see pricing, but you'll need to log in to complete your booking.
            </p>
          </div>
        )} */}
      </div>

      {error && <ErrorAlert message={error} />}

      <BookingDetailsForm
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        deliveryAddress={deliveryAddress}
        onStartDateChange={onStartDateChange}
        onStartTimeChange={onStartTimeChange}
        onEndDateChange={onEndDateChange}
        onEndTimeChange={onEndTimeChange}
        onDeliveryAddressChange={onDeliveryAddressChange}
      />

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-emerald-500 transition-colors font-semibold"
        >
          Back
        </button>
        <button
          onClick={onCreateBooking}
          disabled={!startDate || !endDate || isBooking}
          className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking 
            ? 'Creating Booking...' 
            : isAuthenticated 
              ? 'Create Booking' 
              : 'Login to Book'
          }
          {!isBooking && <ArrowRight className="h-5 w-5 ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default BookingDetailsStep;
