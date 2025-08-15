import { useState } from 'react';
import { Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-hot-toast';

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bikeName: string;
  bikeId: string;
  startDate: string;
  endDate: string;
  status: string;
  value: string;
  bookingNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  packageType: string;
};

type BookingRequestsProps = {
  bookings: Booking[];
  onBookingUpdate?: () => void; // Callback to refresh bookings after status change
};

const BookingRequests = ({ bookings, onBookingUpdate }: BookingRequestsProps) => {
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

  // Filter only pending/requested bookings for this component
  const pendingBookings = bookings.filter(booking => 
    booking.status === 'requested' || booking.status === 'pending'
  );

  // Use the pending bookings or show empty state
  const displayBookings = pendingBookings.length > 0 ? pendingBookings : [
    // Empty state data
    {
      id: 'no-requests',
      customerName: 'No pending requests',
      customerPhone: '',
      customerEmail: '',
      bikeName: 'All caught up!',
      bikeId: '',
      startDate: '',
      endDate: '',
      status: 'none',
      value: '$0',
      bookingNumber: '',
      pickupLocation: '',
      dropoffLocation: '',
      packageType: ''
    }
  ];

  const isLoading = (bookingId: string) => loadingStates[bookingId] || false;

  return (
    <div className="space-y-6">
      {displayBookings.map((booking) => {
        // Handle empty state
        if (booking.id === 'no-requests') {
          return (
            <div key={booking.id} className="border border-gray-200 rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending booking requests at the moment.</p>
            </div>
          );
        }

        const isProcessing = isLoading(booking.id);

        return (
          <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-lg font-semibold text-gray-900">New Booking Request</span>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Awaiting Approval
              </span>
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
                </div>
                
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
      })}
    </div>
  );
};

export default BookingRequests;