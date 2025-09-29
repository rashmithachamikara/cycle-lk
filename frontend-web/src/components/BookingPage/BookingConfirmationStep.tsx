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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12">
          {/* Success Icon */}
          <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="h-20 w-20 text-white" />
          </div>
          
          {/* Header */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Booking Request 
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent block">Submitted!</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-6 leading-relaxed max-w-3xl mx-auto">
              Your booking request has been successfully submitted and is currently under review.
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please wait for the partner to accept your request. Once approved, you'll be able to proceed with payment.
            </p>
            
            {/* Decorative Line */}
            <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-8 rounded-full"></div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-left border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Request Details</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-lg text-gray-600">Status:</span>
                <span className="font-semibold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full">Pending Approval</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-lg text-gray-600">Bike:</span>
                <span className="font-semibold text-lg">{selectedBike?.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-lg text-gray-600">Location:</span>
                <span className="font-semibold text-lg">{selectedBike?.location}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-lg text-gray-600">Start Date:</span>
                <span className="font-semibold text-lg">{startDate} {startTime}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-lg text-gray-600">End Date:</span>
                <span className="font-semibold text-lg">{endDate} {endTime}</span>
              </div>
              {deliveryAddress && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-lg text-gray-600">Delivery:</span>
                  <span className="font-semibold text-lg text-green-600">Yes</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span className="text-lg text-gray-600">Estimated Cost:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">${totalPrice}</span>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-12">
            <div className="text-center mb-10">
              <h4 className="text-3xl font-bold text-blue-900 mb-4">What's Next?</h4>
              <p className="text-xl text-blue-700">Follow these simple steps to complete your booking</p>
            </div>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-blue-900 mb-2">Step 1: Wait for Approval</h5>
                  <p className="text-blue-800 text-lg">Your request is currently under review by the bike partner. This usually takes a few hours.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-blue-900 mb-2">Step 2: Get Notified</h5>
                  <p className="text-blue-800 text-lg">You'll receive a notification once the partner accepts your booking request.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-blue-900 mb-2">Step 3: Make Payment</h5>
                  <p className="text-blue-800 text-lg">Check your "Upcoming" tab in the dashboard to proceed with payment and confirm your booking.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-blue-900 mb-2">Thank You!</h5>
                  <p className="text-blue-800 text-lg">Thank you for choosing Cycle.LK for your bike rental needs. We're excited to serve you!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-5 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold text-lg text-center shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 font-semibold text-lg text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationStep;
