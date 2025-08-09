import React from 'react';
import { UserDashboardBooking } from '../../services/bookingService';

interface AdditionalInfoProps {
  booking: UserDashboardBooking;
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ booking }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium">{booking.bookingNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Created:</span>
          <span className="font-medium">{booking.startDate}</span>
        </div>
        {booking.value && (
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">{booking.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfo;
