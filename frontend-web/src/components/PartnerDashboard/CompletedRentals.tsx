// //frontend-web/src/components/PartnerDashboard/CompletedRentals.tsx
// import { Calendar, Users, Star, Download } from 'lucide-react';

// type Booking = {
//   id: string;
//   customerName: string;
//   bikeName: string;
//   bikeId: string;
//   startDate: string;
//   endDate: string;
//   status: string;
//   rating: number;
// };

// type CompletedRentalsProps = {
//   bookings: Booking[];
// };

// const CompletedRentals = ({ bookings }: CompletedRentalsProps) => {
//   return (
//     <div className="space-y-6">
//       {bookings.map((booking) => (
//         <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
//               <span className="text-lg font-semibold text-gray-900">Completed Rental</span>
//             </div>
//             <div className="flex items-center">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-4 w-4 ${
//                     i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName} ({booking.bikeId})</h3>
//               <div className="flex items-center text-gray-600 mb-2">
//                 <Calendar className="h-4 w-4 mr-2" />
//                 <span>{booking.startDate} to {booking.endDate}</span>
//               </div>
//               <div className="flex items-center text-gray-600">
//                 <Users className="h-4 w-4 mr-2" />
//                 <span>Rented by: {booking.customerName}</span>
//               </div>
//             </div>
            
//             <div className="flex items-end justify-end">
//               <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
//                 <Download className="h-4 w-4 mr-2" />
//                 Download Invoice
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CompletedRentals;



import { Calendar, Users, Download, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

type CompletedRental = {
  id: string;
  customerName: string;
  bikeName: string;
  bikeId: string;
  startDate: string;
  endDate: string;
  status: string;
  rating?: number;
  value: string;
  bookingNumber: string;
  customerPhone: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  packageType: string;
}

type CompletedRentalsProps = {
  bookings: CompletedRental[];
};

const CompletedRentals = ({ bookings }: CompletedRentalsProps) => {

  return (
    <div className="space-y-6">
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No completed rentals found.
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-lg font-semibold text-gray-900">Completed Rental</span>
              </div>
              <div className="flex items-center space-x-3">
                <Link 
                  to={`/partner-dashboard/completed-rentals/${booking.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Details
                </Link>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (booking.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName} ({booking.bikeId})</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{booking.startDate} to {booking.endDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Rented by: {booking.customerName}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <strong>Total: {booking.value}</strong>
                </div>
              </div>
              
              <div className="flex items-end justify-end">
                <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompletedRentals;