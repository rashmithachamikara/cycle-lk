// //frontend-web/src/components/PartnerDashboard/BookingRequests.tsx
// import { Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';

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

// type BookingRequestsProps = {
//   bookings: Booking[];
// };

// const BookingRequests = ({ bookings }: BookingRequestsProps) => {
//   return (
//     <div className="space-y-6">
//       {bookings.map((booking) => (
//         <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//               <span className="text-lg font-semibold text-gray-900">Booking Request</span>
//             </div>
//             <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
//               Awaiting Approval
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
//                   <span>Requested by: {booking.customerName}</span>
//                 </div>
//               </div>
              
//               <div className="flex space-x-3">
//                 <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   Approve
//                 </button>
//                 <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
//                   <AlertCircle className="h-4 w-4 mr-2" />
//                   Decline
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

// export default BookingRequests;



import { Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';

const BookingRequests = () => {
  const requestedBookings = [
    {
      id: 'CL2025003',
      customerName: 'David Chen',
      customerPhone: '+94 77 345 6789',
      bikeName: 'Beach Rider',
      bikeId: 'BIKE-3456',
      startDate: '2025-03-20',
      endDate: '2025-03-27',
      status: 'requested',
      value: '$105'
    },
    {
      id: 'CL2025004',
      customerName: 'Maria Garcia',
      customerPhone: '+94 77 456 7890',
      bikeName: 'City Cruiser',
      bikeId: 'BIKE-4567',
      startDate: '2025-03-22',
      endDate: '2025-03-29',
      status: 'requested',
      value: '$105'
    }
  ];

  return (
    <div className="space-y-6">
      {requestedBookings.map((booking) => (
        <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-lg font-semibold text-gray-900">Booking Request</span>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              Awaiting Approval
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
                  <span>Requested by: {booking.customerName}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Decline
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

export default BookingRequests;