import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, CheckCircle, ArrowLeft, MapPin, LogIn } from 'lucide-react';

import { Bike } from '../../services/bikeService';
import { Location } from '../../services/locationService';
import { Partner } from '../../services/partnerService';

interface FinalConfirmationStepProps {
  selectedBike: Bike;
  pickupLocation: Location;
  pickupPartner: Partner | null;
  selectedPartner: Partner;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress?: string;
  totalPrice: number;
  onBack: () => void;
  onConfirmBooking: () => void;
  isBooking: boolean;
  isAuthenticated: boolean;
}

const FinalConfirmationStep: React.FC<FinalConfirmationStepProps> = ({
  selectedBike,
  pickupPartner,
  selectedPartner,
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  totalPrice,
  onBack,
  onConfirmBooking,
  isBooking,
  isAuthenticated
}) => {
  const navigate = useNavigate();

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const startDateTime = formatDate(startDate, startTime);
  const endDateTime = formatDate(endDate, endTime);
  const duration = Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="my-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block my-1 p-2">
          Confirm Your Booking
        </h1>
         {/* Decorative Line */}
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mt-8 rounded-full"></div>
        <p className="text-gray-600 text-xl mt-2">
          Review your booking details before confirming
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Confirmation Details */}
        <div className="lg:col-span-2 space-y-6">
          
          
          {/* Bike Details */}
          <div className="rounded-3xl shadow-2xl  border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Selected Bike</h2>
            <div className="flex items-start space-x-6">
              <img
                src={selectedBike.images?.[0]?.url || '/placeholder-bike.jpg'}
                alt={selectedBike.name}
                className="w-32 h-32 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedBike.name}</h3>
                <p className="text-gray-600 mb-4">{selectedBike.description}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <p className="font-medium capitalize">{selectedBike.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Condition:</span>
                    <p className="font-medium">{selectedBike.condition || 'Excellent'}</p>
                  </div>
                  {selectedBike.specifications && (
                    <>
                      {selectedBike.specifications.frameSize && (
                        <div>
                          <span className="text-sm text-gray-500">Frame Size:</span>
                          <p className="font-medium">{selectedBike.specifications.frameSize}</p>
                        </div>
                      )}
                      {selectedBike.specifications.gears && (
                        <div>
                          <span className="text-sm text-gray-500">Gears:</span>
                          <p className="font-medium">{selectedBike.specifications.gears}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="rounded-3xl shadow-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Location Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pickup Location */}
              <div className=" rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-gray-900">Pickup Partner</h3>
                </div>
                <p className="text-gray-700 font-medium">{pickupPartner?.companyName}</p>
                <p className="text-gray-600 text-sm">
                  {pickupPartner?.address || 'Address not available'}
                </p>
              </div>

              {/* Drop-off Location */}
              <div className="rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-gray-900">Drop-off Partner</h3>
                </div>
                <p className="text-gray-700 font-medium">{selectedPartner.companyName}</p>
                <p className="text-gray-600 text-sm">
                  {selectedPartner.address || selectedPartner.mapLocation?.address || 'Address not available'}
                </p>
                {selectedPartner.verified && (
                  <span className="inline-flex mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✓ Verified Partner
                  </span>
                )}
              </div>
            </div>

            {deliveryAddress && (
              <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">Custom Delivery Address:</h4>
                <p className="text-gray-700">{deliveryAddress}</p>
              </div>
            )}
          </div>

          {/* Rental Period */}
          <div className="rounded-3xl shadow-2xl  border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Rental Period
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start</h3>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    <span>{startDateTime.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mt-1">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>{startDateTime.time}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">End</h3>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                    <span>{endDateTime.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mt-1">
                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                    <span>{endDateTime.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Duration:</span>
                <span className="text-xl font-bold text-blue-600">{duration} days</span>
              </div>
            </div>
          </div>

          {/* Information message */}
          {isBooking && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Please wait...</strong> We're creating your booking and notifying the partner. This may take a few moments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Authentication warning */}
          {!isAuthenticated && (
            <div className="mt-4 p-6 bg-amber-50 rounded-lg border-2 border-amber-400">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Login Required</h3>
                  <p className="text-sm text-amber-700 mb-4">
                    You need to log in to your account to confirm this booking. Don't have an account yet? Sign up to get started!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Pricing Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl shadow-2xl border border-gray-100 p-8 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Pricing Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate:</span>
                <span className="font-medium">LKR {selectedBike.pricing.perDay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">LKR {(duration * selectedBike.pricing.perDay).toLocaleString()}</span>
              </div>
              
              {selectedBike.pricing.deliveryFee && deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">LKR {selectedBike.pricing.deliveryFee.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block my-1 p-2">
                    LKR {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
                <p className="text-sm text-gray-600">
                  Payment will be processed securely after confirmation. 
                  You can pay via cash on delivery or online payment methods.
                </p>
              </div>

              {/* Terms */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Please bring a valid ID for bike pickup</li>
                  <li>• Helmet and safety gear included</li>
                  <li>• Bike must be returned in good condition</li>
                  <li>• Late returns may incur additional charges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={`grid ${!isAuthenticated ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 mt-8`}>
        <button
          onClick={onBack}
          className="flex items-center justify-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Drop-off Selection
        </button>
        
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center px-6 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login to Continue
          </button>
        )}
        
        <button
          onClick={onConfirmBooking}
          disabled={isBooking || !isAuthenticated}
          className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isBooking || !isAuthenticated
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Booking...
            </>
          ) : !isAuthenticated ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Login Required to Confirm
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Booking
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FinalConfirmationStep;
