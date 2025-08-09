import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  QrCode, 
  Navigation, 
  Phone, 
  MessageCircle,
  Download,
  Settings,
  Star,
  Plus
} from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface BookingCardProps {
  booking: UserDashboardBooking;
  type: 'current' | 'requested' | 'past';
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, type }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'current':
        return {
          dotColor: 'bg-green-500',
          title: 'Active Rental',
          badge: 'bg-green-100 text-green-800',
          badgeText: 'In Progress'
        };
      case 'requested':
        return {
          dotColor: 'bg-blue-500',
          title: 'Requested Rental',
          badge: booking.status === 'confirmed' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-yellow-100 text-yellow-800',
          badgeText: booking.status === 'confirmed' ? 'Confirmed' : 'Requested'
        };
      case 'past':
        return {
          dotColor: booking.status === 'completed' ? 'bg-gray-400' : 'bg-red-400',
          title: booking.status === 'completed' ? 'Completed Rental' : 'Cancelled Rental',
          badge: booking.status === 'completed' 
            ? 'bg-gray-100 text-gray-800' 
            : 'bg-red-100 text-red-800',
          badgeText: booking.status === 'completed' ? 'Completed' : 'Cancelled'
        };
      default:
        return {
          dotColor: 'bg-gray-400',
          title: 'Rental',
          badge: 'bg-gray-100 text-gray-800',
          badgeText: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const renderActions = () => {
    switch (type) {
      case 'current':
        return (
          <div className="flex space-x-3">
            <button className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </button>
            <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors">
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </button>
          </div>
        );
      case 'requested':
        return (
          <div className="flex space-x-3">
            <button className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Download Voucher
            </button>
            <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors">
              <Settings className="h-4 w-4 mr-2" />
              Modify
            </button>
          </div>
        );
      case 'past':
        return null; // Actions are handled in the sidebar for past bookings
      default:
        return null;
    }
  };

  const renderSidebar = () => {
    switch (type) {
      case 'current':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Partner Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-600 w-20">Partner:</span>
                <span className="font-medium">{booking.partner}</span>
              </div>
              {booking.partnerPhone && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">Phone:</span>
                  <a href={`tel:${booking.partnerPhone}`} className="text-emerald-600 hover:underline">
                    {booking.partnerPhone}
                  </a>
                </div>
              )}
            </div>
            <div className="flex space-x-2 mt-4">
              {booking.partnerPhone && (
                <button className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </button>
              )}
              <button className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </button>
            </div>
          </div>
        );
      case 'requested':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Pickup Instructions</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Arrive 15 minutes before pickup time</p>
              <p>• Bring valid ID and booking confirmation</p>
              <p>• Contact partner if you're running late</p>
            </div>
            <div className="mt-4">
              <span className="text-gray-600">Partner: </span>
              <span className="font-medium">{booking.partner}</span>
            </div>
          </div>
        );
      case 'past':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            {booking.review && booking.status === 'completed' ? (
              <>
                <h4 className="font-semibold text-gray-900 mb-3">Your Review</h4>
                <p className="text-gray-600 text-sm italic">"{booking.review}"</p>
              </>
            ) : (
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {booking.status === 'completed' ? 'No Review Yet' : 'Booking Details'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {booking.status === 'completed' 
                    ? 'Share your experience with other riders'
                    : `Booking #${booking.bookingNumber}`
                  }
                </p>
              </div>
            )}
            <div className="flex space-x-2 mt-4">
              <button className="flex items-center border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 transition-colors text-sm">
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </button>
              {booking.status === 'completed' && (
                <Link
                  to="/booking"
                  className="flex items-center bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Book Again
                </Link>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 ${statusConfig.dotColor} rounded-full mr-3`}></div>
          <span className="text-lg font-semibold text-gray-900">{statusConfig.title}</span>
        </div>
        <span className={`${statusConfig.badge} px-3 py-1 rounded-full text-sm font-medium`}>
          {statusConfig.badgeText}
        </span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{booking.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{booking.startDate} to {booking.endDate}</span>
            </div>
          </div>
          
          {type === 'past' && booking.rating && booking.rating > 0 && (
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (booking.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">Your Rating</span>
            </div>
          )}
          
          {renderActions()}
        </div>
        
        {renderSidebar()}
      </div>
    </div>
  );
};

export default BookingCard;
