import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Bike } from '../../services/bikeService';
import { Location } from '../../services/locationService';
import ErrorAlert from './ErrorAlert';

interface RentalPeriodStepProps {
  selectedBike: Bike;
  pickupLocation: Location;
  dropoffLocation: Location;
  onBack: () => void;
  onContinue: (rentalData: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    deliveryAddress: string;
  }) => void;
}

const RentalPeriodStep: React.FC<RentalPeriodStepProps> = ({
  selectedBike,
  pickupLocation,
  dropoffLocation,
  onBack,
  onContinue
}) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('18:00');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculate total price based on selected bike and duration
  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const days = Math.ceil(durationHours / 24);
    
    return days * selectedBike.pricing.perDay;
  };

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return false;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const now = new Date();

    if (start <= now) {
      setError('Start date and time must be in the future');
      return false;
    }

    if (end <= start) {
      setError('End date and time must be after start date and time');
      return false;
    }

    setError(null);
    return true;
  };

  const handleContinue = () => {
    if (validateDates()) {
      onContinue({
        startDate,
        startTime,
        endDate,
        endTime,
        deliveryAddress
      });
    }
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Select Your
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block">Rental Period</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Choose your rental dates and times for the {selectedBike.name}
          </p>
          
          {/* Decorative Line */}
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="mb-12">
            <ErrorAlert message={error} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="space-y-12">
            {/* Date and Time Selection */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                <Calendar className="h-7 w-7 mr-3 text-blue-600" />
                Rental Period
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Start Date & Time */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Start Time
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      End Time
                    </label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Duration Display */}
              {startDate && endDate && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center text-blue-800">
                    <Clock className="h-6 w-6 mr-3" />
                    <span className="font-semibold text-lg">
                      Rental Duration: {Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Delivery Information (Optional)
              </h2>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Delivery Address
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter specific delivery address if you want the bike delivered to a custom location..."
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg"
                />
                <p className="text-base text-gray-500 mt-3">
                  Leave empty to pick up from the selected location
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row gap-6">
              <button
                onClick={onBack}
                className="w-full md:w-1/2 flex items-center justify-center px-8 py-5 text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-lg"
              >
                <ArrowLeft className="h-6 w-6 mr-3" />
                Back to Bikes
              </button>
              <button
                onClick={handleContinue}
                disabled={!startDate || !endDate}
                className={`w-full md:w-1/2 flex items-center justify-center px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  startDate && endDate
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Summary
                <ArrowRight className="h-6 w-6 ml-3" />
              </button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Booking Summary
              </h2>

              {/* Selected Bike */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedBike.images?.[0]?.url || '/placeholder-bike.jpg'}
                    alt={selectedBike.name}
                    className="w-20 h-20 object-cover rounded-2xl shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedBike.name}</h3>
                    <p className="text-base text-gray-600">{selectedBike.type}</p>
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-4 py-6 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600">Pickup Location:</span>
                    <span className="text-base font-medium">{pickupLocation.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600">Drop-off Location:</span>
                    <span className="text-base font-medium">{dropoffLocation.name}</span>
                  </div>
                </div>

                {/* Dates */}
                {startDate && endDate && (
                  <div className="space-y-4 py-6 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-base text-gray-600">Start:</span>
                      <span className="text-base font-medium">
                        {new Date(`${startDate}T${startTime}`).toLocaleDateString()} at {startTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base text-gray-600">End:</span>
                      <span className="text-base font-medium">
                        {new Date(`${endDate}T${endTime}`).toLocaleDateString()} at {endTime}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="py-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600">Daily Rate:</span>
                    <span className="text-base font-medium">LKR {selectedBike.pricing.perDay.toLocaleString()}</span>
                  </div>
                  {startDate && endDate && (
                    <>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-base text-gray-600">
                          Duration: {Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <span className="text-xl font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                          LKR {calculateTotalPrice().toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalPeriodStep;
