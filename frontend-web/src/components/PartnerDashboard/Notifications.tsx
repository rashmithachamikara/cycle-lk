import { Bell, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/apiUtils';
import notificationIntegrationService from '../../services/notificationIntegrationService';

// Use the same notification type as the main notifications system
interface DatabaseNotification {
  _id: string;
  userId: string;
  type: 'reminder' | 'offer' | 'system' | 'partner' | 'payment';
  title: string;
  message: string;
  sentVia: string[];
  read: boolean;
  relatedTo?: {
    type: string;
    id: string;
  };
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch recent notifications for partner
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: {
          userId: user.id,
          limit: 5 // Only get recent 5 for sidebar
        }
      });
      
      setNotifications(response.data || []);
      
      // Get unread count
      const unreadResponse = await api.get(`/notifications/unread-count/${user.id}`);
      setUnreadCount(unreadResponse.data.count || 0);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle real-time notification updates
  const handleRealtimeUpdate = useCallback(() => {
    console.log('[Partner Notifications] Real-time update received, refreshing notifications...');
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (user && user.role === 'partner') {
      fetchNotifications();
      
      // Subscribe to real-time notification updates
      const unsubscribe = notificationIntegrationService.onNotificationUpdate(handleRealtimeUpdate);
      console.log('[Partner Notifications] Subscribed to real-time updates');
      
      // Cleanup subscription on unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
          console.log('[Partner Notifications] Unsubscribed from real-time updates');
        }
      };
    }
  }, [user, fetchNotifications, handleRealtimeUpdate]);

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon color based on type
  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-400';
    
    switch (type) {
      case 'partner': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      case 'system': return 'bg-orange-500';
      case 'reminder': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recent notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-3 rounded-lg border transition-colors ${
                notification.read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  getNotificationColor(notification.type, notification.read)
                }`}></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {notification.title}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        <Link 
          to="/notifications"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          View All Notifications
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default Notifications;