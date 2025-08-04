// //frontend-web/src/components/PartnerDashboard/Notifications.tsx
// import { Bell, ChevronRight } from 'lucide-react';

// type Notification = {
//   id: number;
//   type: string;
//   title: string;
//   message: string;
//   time: string;
//   read: boolean;
// };

// type NotificationsProps = {
//   notifications: Notification[];
// };

// const Notifications = ({ notifications }: NotificationsProps) => {
//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
//         <Bell className="h-5 w-5 text-gray-400" />
//       </div>
//       <div className="space-y-4">
//         {notifications.map((notification) => (
//           <div
//             key={notification.id}
//             className={`p-3 rounded-lg border ${
//               notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
//             }`}
//           >
//             <div className="flex items-start">
//               <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
//                 notification.read ? 'bg-gray-400' : 'bg-blue-500'
//               }`}></div>
//               <div className="flex-1">
//                 <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
//                 <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
//                 <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//         <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2">
//           View All Notifications
//           <ChevronRight className="h-4 w-4 ml-1" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Notifications;


import { Bell, ChevronRight } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'You have a new booking request from David Chen',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'return',
      title: 'Bike Return',
      message: 'City Cruiser (BIKE-7890) has been returned',
      time: '1 day ago',
      read: true
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Maintenance Alert',
      message: 'Mountain Explorer (BIKE-4567) is due for maintenance',
      time: '2 days ago',
      read: true
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${
              notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                notification.read ? 'bg-gray-400' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2">
          View All Notifications
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Notifications;