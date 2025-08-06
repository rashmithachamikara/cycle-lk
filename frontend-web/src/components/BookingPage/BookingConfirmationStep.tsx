import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Bell, CreditCard, Heart } from 'lucide-react';
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Request Submitted!</h2>
        <p className="text-gray-600 mb-4">
          Your booking request has been successfully submitted and is currently under review.
        </p>
        <p className="text-gray-600">
          Please wait for the partner to accept your request. Once approved, you'll be able to proceed with payment.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold text-yellow-600">Pending Approval</span>
          </div>
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
            <span className="text-gray-600">Estimated Cost:</span>
            <span className="font-semibold text-emerald-600">${totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold text-blue-900 mb-2">What's Next?</h4>
          <p className="text-blue-700">Follow these simple steps to complete your booking</p>
        </div>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-1">Step 1: Wait for Approval</h5>
              <p className="text-blue-800 text-sm">Your request is currently under review by the bike partner. This usually takes a few hours.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-1">Step 2: Get Notified</h5>
              <p className="text-blue-800 text-sm">You'll receive a notification once the partner accepts your booking request.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-1">Step 3: Make Payment</h5>
              <p className="text-blue-800 text-sm">Check your "Upcoming" tab in the dashboard to proceed with payment and confirm your booking.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-1">Thank You!</h5>
              <p className="text-blue-800 text-sm">Thank you for choosing Cycle.LK for your bike rental needs. We're excited to serve you!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/dashboard"
          className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-center"
        >
          Go to Dashboard
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
