import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CreditCard, 
  Users, 
  MapPin, 
  Calendar, 
  Settings, 
  HelpCircle,
  ExternalLink 
} from 'lucide-react';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

interface DashboardSidebarProps {
  notifications: NotificationProps[];
  onMarkAsRead?: (id: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  notifications, 
  onMarkAsRead 
}) => {
  const quickActions = [
    {
      title: 'Book a Bike',
      description: 'Find and rent bikes near you',
      icon: Calendar,
      link: '/booking',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Find Locations',
      description: 'Discover bike rental spots',
      icon: MapPin,
      link: '/locations',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Invite Friends',
      description: 'Share and earn rewards',
      icon: Users,
      link: '/referrals',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'Payment Methods',
      description: 'Manage your cards',
      icon: CreditCard,
      link: '/profile?tab=payments',
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    }
  ];

  const accountLinks = [
    { title: 'Profile Settings', icon: Settings, link: '/profile' },
    { title: 'Help & Support', icon: HelpCircle, link: '/support' }
  ];

  const getNotificationIcon = (type: NotificationProps['type']) => {
    const baseClasses = "h-4 w-4";
    switch (type) {
      case 'warning':
        return <Bell className={`${baseClasses} text-yellow-500`} />;
      case 'success':
        return <Bell className={`${baseClasses} text-green-500`} />;
      default:
        return <Bell className={`${baseClasses} text-blue-500`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Updates</h3>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                } cursor-pointer transition-colors hover:bg-opacity-80`}
                onClick={() => onMarkAsRead?.(notification.id)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${
                      notification.read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      notification.read ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No new notifications</p>
            </div>
          )}
          
          {notifications.length > 3 && (
            <Link 
              to="/notifications"
              className="block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
            >
              View all notifications
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className={`flex items-center p-3 rounded-lg border transition-colors hover:bg-opacity-80 ${action.color}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{action.title}</h4>
                  <p className="text-xs opacity-75">{action.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 opacity-50" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
        <div className="space-y-2">
          {accountLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                to={link.link}
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Icon className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">{link.title}</span>
                <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
