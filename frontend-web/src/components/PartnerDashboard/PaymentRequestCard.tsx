import { Clock, User, Bike, Calendar, MapPin, DollarSign, Phone, Mail } from 'lucide-react';
import { PartnerDashboardBooking } from '../../services/bookingService';

interface PaymentRequestCardProps {
  booking: PartnerDashboardBooking;
}

const PaymentRequestCard = ({ booking }: PaymentRequestCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'paid':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    // Remove LKR if present and parse
    const numericAmount = parseFloat(amount.replace('$', '').replace(',', ''));
    return `LKR ${numericAmount.toFixed(2)}`;
  };

  // Calculate days until due (assuming 24 hours from booking confirmation)
  const getDaysUntilDue = () => {
    const now = new Date();
    const bookingDate = new Date(booking.startDate);
    const dueDate = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before start
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue <= 1 && daysUntilDue >= 0;

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
      isOverdue ? 'border-red-200 bg-red-50' : 
      isUrgent ? 'border-yellow-200 bg-yellow-50' : 
      'border-gray-200 hover:border-blue-300'
    }`}>
      {/* Header with Status and Priority */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.customerName}
              </h3>
              <p className="text-sm text-gray-500">
                Booking #{booking.bookingNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(isOverdue || isUrgent) && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isOverdue ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {isOverdue ? '🚨 Overdue' : '⚡ Urgent'}
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.paymentStatus)}`}>
              <Clock className="h-3 w-3 mr-1" />
              Payment Pending
            </span>
          </div>
        </div>

        {/* Customer Contact Info */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{booking.customerEmail}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{booking.customerPhone}</span>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Bike Information */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bike className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{booking.bikeName}</div>
              <div className="text-xs text-gray-500">Bicycle</div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(booking.startDate)}
              </div>
              <div className="text-xs text-gray-500">
                to {formatDate(booking.endDate)}
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{booking.pickupLocation}</div>
              <div className="text-xs text-gray-500">Pickup</div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{formatCurrency(booking.value)}</div>
              <div className="text-xs text-gray-500">Amount Due</div>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className={`mt-4 p-3 rounded-lg border ${
          isOverdue ? 'bg-red-50 border-red-200' :
          isUrgent ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${
              isOverdue ? 'text-red-800' :
              isUrgent ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              Payment Timeline
            </span>
            <span className={`${
              isOverdue ? 'text-red-600' :
              isUrgent ? 'text-yellow-600' :
              'text-blue-600'
            }`}>
              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
               daysUntilDue === 0 ? 'Due today' :
               `${daysUntilDue} days remaining`}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            {isOverdue ? 'Customer has missed the payment deadline' :
             isUrgent ? 'Payment deadline approaching soon' :
             'Customer has time to complete payment'}
          </div>
        </div>
      </div>

      {/* Footer with Status */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Status: <span className="font-medium text-yellow-600">Confirmed, awaiting payment</span>
          </span>
          <span className="text-gray-500">
            Confirmed on {formatDate(booking.startDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestCard;
