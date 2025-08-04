// //frontend-web/src/components/PartnerDashboard/MonthlySnapshot.tsx
// import { ArrowUp, ArrowDown, ArrowUpRight } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const MonthlySnapshot = () => {
//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Snapshot</h3>
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <span className="text-gray-600">Total Revenue</span>
//           <div className="flex items-center">
//             <span className="font-semibold text-gray-900">$2,450</span>
//             <span className="text-green-500 text-xs ml-2 flex items-center">
//               <ArrowUp className="h-3 w-3 mr-0.5" />
//               18%
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-gray-600">Total Bookings</span>
//           <div className="flex items-center">
//             <span className="font-semibold text-gray-900">32</span>
//             <span className="text-green-500 text-xs ml-2 flex items-center">
//               <ArrowUp className="h-3 w-3 mr-0.5" />
//               7%
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-gray-600">Average Duration</span>
//           <div className="flex items-center">
//             <span className="font-semibold text-gray-900">4.5 days</span>
//             <span className="text-green-500 text-xs ml-2 flex items-center">
//               <ArrowUp className="h-3 w-3 mr-0.5" />
//               5%
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-gray-600">Maintenance Costs</span>
//           <div className="flex items-center">
//             <span className="font-semibold text-gray-900">$350</span>
//             <span className="text-red-500 text-xs ml-2 flex items-center">
//               <ArrowDown className="h-3 w-3 mr-0.5" />
//               4%
//             </span>
//           </div>
//         </div>
//         <Link
//           to="/partner-dashboard/analytics"
//           className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2"
//         >
//           View Detailed Analytics
//           <ArrowUpRight className="h-4 w-4 ml-1" />
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default MonthlySnapshot;



import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, ArrowUpRight } from 'lucide-react';

const MonthlySnapshot = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Snapshot</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Revenue</span>
          <div className="flex items-center">
            <span className="font-semibold text-gray-900">$2,450</span>
            <span className="text-green-500 text-xs ml-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              18%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Bookings</span>
          <div className="flex items-center">
            <span className="font-semibold text-gray-900">32</span>
            <span className="text-green-500 text-xs ml-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              7%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Average Duration</span>
          <div className="flex items-center">
            <span className="font-semibold text-gray-900">4.5 days</span>
            <span className="text-green-500 text-xs ml-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              5%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Maintenance Costs</span>
          <div className="flex items-center">
            <span className="font-semibold text-gray-900">$350</span>
            <span className="text-red-500 text-xs ml-2 flex items-center">
              <ArrowDown className="h-3 w-3 mr-0.5" />
              4%
            </span>
          </div>
        </div>
        <Link
          to="/partner-dashboard/analytics"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2"
        >
          View Detailed Analytics
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default MonthlySnapshot;