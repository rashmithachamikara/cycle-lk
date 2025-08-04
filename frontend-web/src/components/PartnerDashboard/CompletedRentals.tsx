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



import { Calendar, Users, Download, Star } from 'lucide-react';

const CompletedRentals = () => {
  const recentBookings = [
    {
      id: 'CL2025005',
      customerName: 'Robert Smith',
      bikeName: 'Mountain Explorer',
      bikeId: 'BIKE-5678',
      startDate: '2025-02-10',
      endDate: '2025-02-17',
      status: 'completed',
      rating: 5,
    },
    {
      id: 'CL2025006',
      customerName: 'Emma Wilson',
      bikeName: 'Beach Rider',
      bikeId: 'BIKE-6789',
      startDate: '2025-02-15',
      endDate: '2025-02-18',
      status: 'completed',
      rating: 4,
    }
  ];

  return (
    <div className="space-y-6">
      {recentBookings.map((booking) => (
        <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
              <span className="text-lg font-semibold text-gray-900">Completed Rental</span>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
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
            </div>
            
            <div className="flex items-end justify-end">
              <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletedRentals;