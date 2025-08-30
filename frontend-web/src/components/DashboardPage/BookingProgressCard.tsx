import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  CreditCard,
  XCircle,
  Play
} from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface BookingProgressCardProps {
  booking: UserDashboardBooking;
}

const BookingProgressCard: React.FC<BookingProgressCardProps> = ({ booking }) => {
  const navigate = useNavigate();

  // Define booking progress steps
  const getProgressSteps = (booking: UserDashboardBooking) => {
    const baseSteps = [
      {
        id: 'requested',
        label: 'Requested',
        icon: Clock,
        description: 'Booking submitted'
      },
      {
        id: 'confirmed',
        label: 'Confirmed',
        icon: CheckCircle,
        description: 'Partner accepted'
      },
      {
        id: 'paid',
        label: 'Payment',
        icon: CreditCard,
        description: 'Payment completed'
      },
      {
        id: 'active',
        label: 'Active',
        icon: Play,
        description: 'Rental in progress'
      },
      {
        id: 'completed',
        label: 'Completed',
        icon: CheckCircle,
        description: 'Rental finished'
      }
    ];

    // Handle cancelled bookings
    if (booking.status === 'cancelled') {
      return [
        baseSteps[0], // requested
        {
          id: 'cancelled',
          label: 'Cancelled',
          icon: XCircle,
          description: 'Booking cancelled'
        }
      ];
    }

    return baseSteps;
  };

  // Get current step index based on booking status and payment status
  const getCurrentStepIndex = (booking: UserDashboardBooking) => {
    if (booking.status === 'cancelled') return 1;
    if (booking.status === 'requested') return 0;
    if (booking.status === 'confirmed') {
      return booking.paymentStatus === 'paid' ? 2 : 1;
    }
    if (booking.status === 'active') return 3;
    if (booking.status === 'completed') return 4;
    return 0;
  };

  const steps = getProgressSteps(booking);
  const currentStepIndex = getCurrentStepIndex(booking);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'text-blue-600 bg-blue-50';
      case 'confirmed': return 'text-yellow-600 bg-yellow-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCardClick = () => {
    navigate(`/booking-details/${booking.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-gray-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
          <div>
            <h3 className="font-semibold text-gray-900">{booking.bikeName}</h3>
            <p className="text-sm text-gray-600">#{booking.bookingNumber}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>From: {booking.pickupLocation}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>To: {booking.dropoffLocation}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{booking.startDate} - {booking.endDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="font-medium">{booking.value}</span>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">Booking Progress</h4>
          <span className="text-xs text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
          
          {/* Progress line */}
          <div 
            className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
            style={{ 
              width: steps.length > 1 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
            }}
          ></div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isCancelled = booking.status === 'cancelled' && step.id === 'cancelled';

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step circle */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? isCancelled 
                        ? 'bg-red-500 border-red-500 text-white' 
                        : 'bg-blue-500 border-blue-500 text-white'
                      : isCurrent
                        ? 'bg-white border-blue-500 text-blue-500'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-20">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Status Alert */}
      {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800 font-medium">
              Payment Required - Click to complete payment
            </span>
          </div>
        </div>
      )}

      {/* Next Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Click for details</span>
          <div className="flex items-center space-x-2">
            {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Payment Due
              </span>
            )}
            {booking.status === 'active' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Ongoing
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProgressCard;
