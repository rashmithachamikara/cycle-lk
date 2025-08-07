import React from 'react';
import { CheckCircle } from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface BookingTimelineProps {
  booking: UserDashboardBooking;
}

const BookingTimeline: React.FC<BookingTimelineProps> = ({ booking }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Booking Created</div>
            <div className="text-sm text-gray-600">Request submitted successfully</div>
            <div className="text-xs text-gray-400 mt-1">{booking.startDate}</div>
          </div>
        </div>
        
        {booking.status !== 'requested' && (
          <div className="flex items-start">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Booking Confirmed</div>
              <div className="text-sm text-gray-600">Partner accepted your request</div>
            </div>
          </div>
        )}
        
        {booking.status === 'completed' && (
          <div className="flex items-start">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Rental Completed</div>
              <div className="text-sm text-gray-600">Bike returned successfully</div>
              <div className="text-xs text-gray-400 mt-1">{booking.endDate}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTimeline;
