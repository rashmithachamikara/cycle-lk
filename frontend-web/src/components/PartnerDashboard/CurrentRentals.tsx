// //frontend-web/src/components/PartnerDashboard/CurrentRentals.tsx
// import { Calendar, Users, Phone, Settings } from 'lucide-react';

// type Booking = {
//   id: string;
//   customerName: string;
//   customerPhone: string;
//   bikeName: string;
//   bikeId: string;
//   startDate: string;
//   endDate: string;
//   status: string;
//   value: string;
// };

// type CurrentRentalsProps = {
//   bookings: Booking[];
// };

// const CurrentRentals = ({ bookings }: CurrentRentalsProps) => {
//   return (
//     <div className="space-y-6">
//       {bookings.map((booking) => (
//         <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
//               <span className="text-lg font-semibold text-gray-900">Active Rental</span>
//             </div>
//             <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//               In Progress
//             </span>
//           </div>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName} ({booking.bikeId})</h3>
//                 <div className="flex items-center text-gray-600 mb-2">
//                   <Calendar className="h-4 w-4 mr-2" />
//                   <span>{booking.startDate} to {booking.endDate}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <Users className="h-4 w-4 mr-2" />
//                   <span>Rented by: {booking.customerName}</span>
//                 </div>
//               </div>
              
//               <div className="flex space-x-3">
//                 <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
//                   <Phone className="h-4 w-4 mr-2" />
//                   Contact Customer
//                 </button>
//                 <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
//                   <Settings className="h-4 w-4 mr-2" />
//                   Manage Booking
//                 </button>
//               </div>
//             </div>
            
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Booking ID:</span>
//                   <span className="font-medium">{booking.id}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Customer Phone:</span>
//                   <span className="font-medium">{booking.customerPhone}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Value:</span>
//                   <span className="font-medium">{booking.value}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Duration:</span>
//                   <span className="font-medium">7 days</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CurrentRentals;



import { Calendar, Users, Phone, Settings } from 'lucide-react';

const CurrentRentals = () => {
  const currentBookings = [
    {
      id: 'CL2025001',
      customerName: 'John Doe',
      customerPhone: '+94 77 123 4567',
      bikeName: 'City Cruiser',
      bikeId: 'BIKE-1234',
      startDate: '2025-03-15',
      endDate: '2025-03-22',
      status: 'active',
      value: '$105'
    },
    {
      id: 'CL2025002',
      customerName: 'Sarah Johnson',
      customerPhone: '+94 77 234 5678',
      bikeName: 'Mountain Explorer',
      bikeId: 'BIKE-2345',
      startDate: '2025-03-18',
      endDate: '2025-03-25',
      status: 'active',
      value: '$140'
    }
  ];

  return (
    <div className="space-y-6">
      {currentBookings.map((booking) => (
        <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-lg font-semibold text-gray-900">Active Rental</span>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              In Progress
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
              
              <div className="flex space-x-3">
                <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Customer
                </button>
                <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Booking
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{booking.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Customer Phone:</span>
                  <span className="font-medium">{booking.customerPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">{booking.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">7 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentRentals;