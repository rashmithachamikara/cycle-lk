import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface BookingHeaderProps {
  booking: UserDashboardBooking;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ booking }) => {
  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: status === 'active' ? 'Active' : 'Confirmed'
        };
      case 'requested':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Requested'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Cancelled'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{booking.bikeName}</h1>
        <div className="flex items-center text-gray-600">
          <span className="text-sm">Booking #{booking.bookingNumber}</span>
        </div>
      </div>

      <div className={`flex items-center px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
        <StatusIcon className={`h-5 w-5 mr-2 ${statusConfig.color}`} />
        <span className={`font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
};

export default BookingHeader;
