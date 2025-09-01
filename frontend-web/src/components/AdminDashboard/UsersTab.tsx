import { Search, Filter } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  joined: string;
  bookings: number;
  status: string;
}

interface UsersTabProps {
  users: User[];
}

const UsersTab: React.FC<UsersTabProps> = ({ users }) => {
  return (
    <div className="space-y-8">
      {/* Users Management Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage all registered users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute left-3 top-2.5">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                    <button className="text-red-600 hover:text-red-900">Block</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-60 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg flex items-end justify-between p-4">
            {[20, 35, 45, 60, 75, 85, 95].map((height, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-gradient-to-t from-purple-500 to-indigo-600 rounded-t-md" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs text-gray-600 mt-2">
                  {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][index]}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">68%</div>
              <div className="text-sm text-gray-600">Local Users</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">32%</div>
              <div className="text-sm text-gray-600">International</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-violet-600 mb-1">45%</div>
              <div className="text-sm text-gray-600">Returning</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">55%</div>
              <div className="text-sm text-gray-600">New Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
