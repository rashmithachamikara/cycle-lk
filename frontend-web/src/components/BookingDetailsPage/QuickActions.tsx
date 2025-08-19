import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Navigation, 
  Phone, 
  Download, 
  MessageCircle, 
  CreditCard
} from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface QuickActionsProps {
  booking: UserDashboardBooking;
}

const QuickActions: React.FC<QuickActionsProps> = ({ booking }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        {/* Status-specific actions */}
        {(booking.status === 'active') && (
          <>
            <button className="w-full flex items-center justify-center bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors">
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </button>
            <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
              <Navigation className="h-4 w-4 mr-2" />
              Get Drop Locations
            </button>
            {booking.partnerPhone && (
              <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                <Phone className="h-4 w-4 mr-2" />
                Call Partner
              </button>
            )}
          </>
        )}

        {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
          <>
            <button className="w-full flex items-center justify-center border bg-yellow-600 text-white px-4 py-3 rounded-lg transition-colors hover:bg-yellow-700"
              onClick={() => navigate(`/payments`)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </button>
          </>
        )}

        {booking.status === 'requested' && (
          <>
            <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
              <Navigation className="h-4 w-4 mr-2" />
              Navigate to Pickup Location
            </button>
            <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
              Modify Booking
            </button>
          </>
        )}
        
        {(booking.status === 'completed' || booking.status === 'cancelled') && (
          <>
            <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </button>
            {booking.status === 'completed' && (
              <button 
                onClick={() => navigate('/booking')}
                className="w-full flex items-center justify-center bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Book Again
              </button>
            )}
          </>
        )}
        
        <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
