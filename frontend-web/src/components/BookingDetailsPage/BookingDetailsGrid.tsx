import React from 'react';
import { MapPin, Calendar, User, Phone, CreditCard } from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface BookingDetailsGridProps {
  booking: UserDashboardBooking;
}

const BookingDetailsGrid: React.FC<BookingDetailsGridProps> = ({ booking }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900">Pickup Location</div>
            <div className="text-gray-600">{booking.location}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900">Rental Period</div>
            <div className="text-gray-600">{booking.startDate} to {booking.endDate}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900">Partner</div>
            <div className="text-gray-600">{booking.partner}</div>
          </div>
        </div>
        
        {booking.partnerPhone && (
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Contact</div>
              <a 
                href={`tel:${booking.partnerPhone}`} 
                className="text-emerald-600 hover:underline"
              >
                {booking.partnerPhone}
              </a>
            </div>
          </div>
        )}
        
        {booking.value && (
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Total Cost</div>
              <div className="text-gray-600 font-semibold">
                {booking.value}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsGrid;
