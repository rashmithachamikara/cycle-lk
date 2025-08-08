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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select Rental Period
        </h1>
        <p className="text-gray-600">
          Choose your rental dates and times for the {selectedBike.name}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-8">
          {/* Date and Time Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Rental Period
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Start Date & Time */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    Rental Duration: {Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Delivery Information (Optional)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter specific delivery address if you want the bike delivered to a custom location..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Leave empty to pick up from the selected location
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bikes
            </button>
            <button
              onClick={handleContinue}
              disabled={!startDate || !endDate}
              className={`flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                startDate && endDate
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Summary
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Booking Summary
            </h2>

            {/* Selected Bike */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedBike.images?.[0]?.url || '/placeholder-bike.jpg'}
                  alt={selectedBike.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedBike.name}</h3>
                  <p className="text-sm text-gray-600">{selectedBike.type}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3 py-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pickup Location:</span>
                  <span className="text-sm font-medium">{pickupLocation.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Drop-off Location:</span>
                  <span className="text-sm font-medium">{dropoffLocation.name}</span>
                </div>
              </div>

              {/* Dates */}
              {startDate && endDate && (
                <div className="space-y-3 py-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Start:</span>
                    <span className="text-sm font-medium">
                      {new Date(`${startDate}T${startTime}`).toLocaleDateString()} at {startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End:</span>
                    <span className="text-sm font-medium">
                      {new Date(`${endDate}T${endTime}`).toLocaleDateString()} at {endTime}
                    </span>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Rate:</span>
                  <span className="text-sm">LKR {selectedBike.pricing.perDay.toLocaleString()}</span>
                </div>
                {startDate && endDate && (
                  <>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">
                        Duration: {Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-blue-600">
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
  );
};

export default RentalPeriodStep;
