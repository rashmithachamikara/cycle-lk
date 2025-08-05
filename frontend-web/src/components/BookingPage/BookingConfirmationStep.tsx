import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Bike } from '../../services/bikeService';

interface BookingConfirmationStepProps {
  selectedBike: Bike | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress: string;
  totalPrice: number;
}

const BookingConfirmationStep = ({
  selectedBike,
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  totalPrice
}: BookingConfirmationStepProps) => {
  return (
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
            <span className="font-semibold text-emerald-600">${totalPrice}</span>
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
  );
};

export default BookingConfirmationStep;
