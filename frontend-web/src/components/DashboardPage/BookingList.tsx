import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import BookingCard from './BookingCard';
import { UserDashboardBooking } from '../../services/bookingService';

interface BookingListProps {
  bookings: UserDashboardBooking[];
  loading: boolean;
  error: string | null;
  type: 'current' | 'requested' | 'past';
  onRetry?: () => void;
}

const BookingList: React.FC<BookingListProps> = ({ 
  bookings, 
  loading, 
  error, 
  type, 
  onRetry 
}) => {

  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                <div className="h-6 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-20"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-40"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-10 bg-gray-300 rounded w-32"></div>
                  <div className="h-10 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Bookings</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (bookings.length === 0) {
    const getEmptyStateContent = () => {
      switch (type) {
        case 'current':
          return {
            title: 'No Active Rentals',
            description: 'You don\'t have any active bike rentals at the moment.',
            action: 'Browse Available Bikes',
            link: '/booking'
          };
        case 'requested':
          return {
            title: 'No Pending Requests',
            description: 'You don\'t have any pending rental requests.',
            action: 'Make a New Booking',
            link: '/booking'
          };
        case 'past':
          return {
            title: 'No Past Rentals',
            description: 'You haven\'t completed any bike rentals yet.',
            action: 'Start Your First Rental',
            link: '/booking'
          };
        default:
          return {
            title: 'No Bookings',
            description: 'No bookings found.',
            action: 'Browse Bikes',
            link: '/booking'
          };
      }
    };

    const emptyState = getEmptyStateContent();

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyState.title}</h3>
        <p className="text-gray-600 mb-6">{emptyState.description}</p>
        <Link
          to={emptyState.link}
          className="inline-flex items-center bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {emptyState.action}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          onClick={() => navigate(`/booking-details/${booking.id}`)}
          className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
        >
          <BookingCard
            booking={booking}
            type={type}
          />
        </div>
      ))}
    </div>
  );
};

export default BookingList;
