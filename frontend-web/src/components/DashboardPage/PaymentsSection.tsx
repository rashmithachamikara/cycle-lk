import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Calendar,
  Bike
} from 'lucide-react';

export interface PaymentPendingBooking {
  id: string;
  bikeName: string;
  bikeImage?: string;
  bikeImages?: string[]; // Support for multiple images array
  partnerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'requested' | 'confirmed' | 'active';
  bookingNumber: string;
  dueDate?: string;
}

interface PaymentsSectionProps {
  pendingPayments: PaymentPendingBooking[];
  onPayNow: (bookingId: string) => void;
  loading?: boolean;
}

const PaymentsSection: React.FC<PaymentsSectionProps> = ({
  pendingPayments,
  onPayNow,
  loading = false
}) => {
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const handlePayNow = async (bookingId: string) => {
    setProcessingPayment(bookingId);
    try {
      await onPayNow(bookingId);
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isPaymentOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-center mb-2 sm:mb-0">
          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h2>
        </div>
        {pendingPayments.length > 0 && (
          <div className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
            {pendingPayments.length} Pending
          </div>
        )}
      </div>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">All Payments Up to Date</h3>
          <p className="text-sm sm:text-base text-gray-600 px-4">You have no pending payments at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pendingPayments.map((booking) => (
            <div
              key={booking.id}
              className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 ${
                isPaymentOverdue(booking.dueDate)
                  ? 'border-red-200 bg-red-50'
                  : booking.paymentStatus === 'failed'
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex space-x-3 sm:space-x-4 flex-1 mb-3 sm:mb-0">
                  {/* Bike Image */}
                  <div className="flex-shrink-0">
                    {(() => {
                      // Determine the image source - prefer bikeImage, then first from bikeImages array
                      const imageSource = booking.bikeImage || 
                                         (booking.bikeImages && booking.bikeImages.length > 0 ? booking.bikeImages[0] : null);
                      
                      return imageSource ? (
                        <img
                          src={imageSource}
                          alt={booking.bikeName}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                          onError={(e) => {
                            // Replace with fallback on error
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    {/* Fallback bike icon - always present but hidden if image loads */}
                    <div 
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200 shadow-sm"
                      style={{ display: (booking.bikeImage || (booking.bikeImages && booking.bikeImages.length > 0)) ? 'none' : 'flex' }}
                    >
                      <Bike className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                    </div>
                  </div>
                  
                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{booking.bikeName}</h3>
                      {isPaymentOverdue(booking.dueDate) && (
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      <div className="flex items-center">
                        <Bike className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{booking.partnerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">#{booking.bookingNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'requested'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Booking Accepted' : 
                         booking.status === 'requested' ? 'Pending Approval' : 
                         booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.dueDate && (
                        <span className={`text-xs whitespace-nowrap ${
                          isPaymentOverdue(booking.dueDate) ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          Due: {formatDate(booking.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Amount and Action */}
                <div className="w-full sm:w-auto sm:text-right sm:ml-4">
                  <div className="flex justify-between items-center sm:block mb-3 sm:mb-2">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                      LKR {booking.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-col gap-2">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handlePayNow(booking.id)}
                        disabled={processingPayment === booking.id}
                        className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          isPaymentOverdue(booking.dueDate)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                      >
                        {processingPayment === booking.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {isPaymentOverdue(booking.dueDate) ? 'Pay Now (Overdue)' : 'Pay Now'}
                            </span>
                            <span className="sm:hidden">
                              {isPaymentOverdue(booking.dueDate) ? 'Pay (Overdue)' : 'Pay Now'}
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    {booking.status === 'requested' && (
                      <div className="flex items-center justify-center sm:justify-end text-xs sm:text-sm text-yellow-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Awaiting Approval</span>
                      </div>
                    )}

                    {booking.paymentStatus === 'failed' && (
                      <div className="text-red-600 text-xs sm:text-sm text-center sm:text-right mb-2">Payment Failed</div>
                    )}

                    <Link
                      to={`/booking-details/${booking.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center justify-center sm:justify-end mt-1 sm:mt-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Payment Status Indicator */}
              {booking.status === 'confirmed' && (
                <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium text-sm sm:text-base">Initial Payment Required</p>
                      <p className="text-blue-700 text-xs sm:text-sm mt-1">
                        Your booking has been approved by the partner. Please complete the initial payment to activate your rental.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isPaymentOverdue(booking.dueDate) && (
                <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium text-sm sm:text-base">Payment Overdue</p>
                      <p className="text-red-700 text-xs sm:text-sm mt-1">
                        This payment is overdue. Please pay immediately to avoid cancellation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsSection;
