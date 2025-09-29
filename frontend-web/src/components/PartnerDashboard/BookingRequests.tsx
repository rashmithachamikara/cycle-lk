import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { bookingService,PartnerDashboardBooking } from '../../services/bookingService';
import { toast } from 'react-hot-toast';
import { Partner } from '../../services/partnerService';

type BookingRequestsProps = {
  bookings: PartnerDashboardBooking[];
  partner: Partner | null;
  onBookingUpdate?: () => void; // Callback to refresh bookings after status change
};

const BookingRequests = ({ bookings, partner, onBookingUpdate }: BookingRequestsProps) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Handle booking approval
  const handleApprove = async (bookingId: string, bookingNumber: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [bookingId]: true }));
      
      // Update booking status to confirmed
      await bookingService.updateBookingStatus(bookingId, 'confirmed');
      
      // Show success message
      toast.success(`Booking ${bookingNumber} approved successfully! Customer will be notified.`);
      
      // Refresh the bookings list
      if (onBookingUpdate) {
        onBookingUpdate();
      }
      
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Handle booking decline
  const handleDecline = async (bookingId: string, bookingNumber: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [bookingId]: true }));
      
      // Update booking status to cancelled
      await bookingService.updateBookingStatus(bookingId, 'cancelled');
      
      // Show success message
      toast.success(`Booking ${bookingNumber} declined. Customer will be notified.`);
      
      // Refresh the bookings list
      if (onBookingUpdate) {
        onBookingUpdate();
      }
      
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error('Failed to decline booking. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Filter bookings for bikes currently at this partner's location (can approve/decline)
  const myPendingBookings = bookings.filter(booking => 
    booking.status === 'requested' && booking.currentBikePartnerId === partner?._id
  );

  // Bookings for bikes that are owned by this partner but currently at other partners (view-only)
  const bookingsForBikesAtOthers = bookings.filter(booking => 
    booking.status === 'requested' && booking.currentBikePartnerId !== partner?._id
  );

  console.log('My pending bookings:', myPendingBookings);
  console.log('Bookings for bikes at other partners:', bookingsForBikesAtOthers);

  const renderBookingCard = (booking: PartnerDashboardBooking, canApprove: boolean = true) => {
    // Handle empty state
    if (booking.id === 'no-requests') {
      return (
        <div key={booking.id} className="border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{booking.bikeName}</h3>
          <p className="text-gray-600">{booking.customerName}</p>
        </div>
      );
    }

    const isProcessing = isLoading(booking.id);
    const isAtOtherPartner = booking.currentBikePartnerId !== partner?._id;

    return (
      <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isAtOtherPartner ? 'bg-orange-500' : 'bg-blue-500'
            }`}></div>
            <span className="text-lg font-semibold text-gray-900">
              {isAtOtherPartner ? 'Your Bike at Another Partner' : 'New Booking Request'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              to={`/partner-dashboard/booking-requests/${booking.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Link>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isAtOtherPartner 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isAtOtherPartner ? 'At Other Partner' : 'Awaiting Approval'}
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{booking.startDate} to {booking.endDate}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Users className="h-4 w-4 mr-2" />
                <span>Customer: {booking.customerName}</span>
              </div>
              {booking.customerPhone && (
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-sm">📞 {booking.customerPhone}</span>
                </div>
              )}
              {booking.pickupLocation && (
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">📍 Pickup: {booking.pickupLocation}</span>
                </div>
              )}
              {isAtOtherPartner && booking.currentBikePartnerName && (
                <div className="flex items-center text-orange-600 mt-2">
                  <span className="text-sm">🏢 Currently at: {booking.currentBikePartnerName}</span>
                </div>
              )}
            </div>
            
            {canApprove && !isAtOtherPartner ? (
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleApprove(booking.id, booking.bookingNumber)}
                  disabled={isProcessing}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? 'Approving...' : 'Approve'}
                </button>
                <button 
                  onClick={() => handleDecline(booking.id, booking.bookingNumber)}
                  disabled={isProcessing}
                  className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? 'Declining...' : 'Decline'}
                </button>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {isAtOtherPartner 
                    ? 'This bike is currently at another partner location. Only they can approve/decline this request.'
                    : 'You cannot approve/decline this booking request.'}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">{booking.bookingNumber || booking.id}</span>
              </div>
              {booking.customerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-sm">{booking.customerEmail}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Value:</span>
                <span className="font-medium text-green-600">{booking.value}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium">{booking.packageType}</span>
              </div>
              {booking.dropoffLocation && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dropoff:</span>
                  <span className="font-medium text-sm">{booking.dropoffLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = (bookingId: string) => loadingStates[bookingId] || false;

  return (
    <div className="space-y-8">
      {/* My Booking Requests Section */}
      <div>
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Booking Requests</h2>
            <p className="text-gray-600">Bookings for bikes currently at your location - you can approve or decline these</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {myPendingBookings.length > 0 ? (
            myPendingBookings.map((booking) => renderBookingCard(booking, true))
          ) : (
            renderBookingCard({
              id: 'no-requests',
              customerName: 'No pending requests at your location',
              customerPhone: '',
              customerEmail: '',
              bikeName: 'All caught up!',
              bikeId: '',
              bikeImages: [],
              startDate: '',
              endDate: '',
              status: 'requested' as const,
              value: 'LKR 0',
              bookingNumber: '',
              pickupLocation: '',
              dropoffLocation: '',
              packageType: '',
              paymentStatus: 'pending' as const
            }, false)
          )}
        </div>
      </div>

      {/* Bikes at Other Partners Section */}
      {bookingsForBikesAtOthers.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-orange-500 rounded-full mr-4"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Bikes at Other Partners</h2>
              <p className="text-gray-600">Booking requests for your bikes that are currently at other partner locations</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {bookingsForBikesAtOthers.map((booking) => renderBookingCard(booking, false))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingRequests;