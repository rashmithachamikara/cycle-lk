import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter,
  User,
  CreditCard,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/apiUtils';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface DatabaseNotification {
  _id: string;
  userId: string;
  type: 'reminder' | 'offer' | 'system' | 'partner' | 'payment' | 'owner';
  title: string;
  message: string;
  relatedTo?: {
    type: 'booking' | 'bike' | 'partner' | 'user' | 'payment';
    id: string;
  };
  read: boolean;
  sentVia: ('app' | 'email' | 'sms')[];
  createdAt: string;
  updatedAt: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'reminder' | 'offer' | 'system' | 'partner' | 'payment' | 'owner'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: {
          userId: user?.id,
          limit: 100
        }
      });
      
      setNotifications(response.data);
      
      // Get unread count
      const unreadResponse = await api.get(`/notifications/unread-count/${user?.id}`);
      setUnreadCount(unreadResponse.data.count);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const applyFilters = useCallback(() => {
    let filtered = [...notifications];

    // Apply read/unread filter
    if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, typeFilter]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/mark-read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'offer':
        return <AlertCircle className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      case 'partner':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      case 'owner':
        return <User className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: DatabaseNotification) => {
    if (!notification.relatedTo) return null;

    switch (notification.relatedTo.type) {
      case 'booking':
        if(user?.role === 'partner') {
          // Route to booking requests for new bookings, or booking details for specific bookings
          if (notification.type === 'owner' && notification.title.toLowerCase().includes('drop-off')) {
            return `/partner-dashboard/drop-off-bike`;
          }
          return `/partner-dashboard/booking-requests}`;
        } else if(user?.role === 'user') {
          return `/dashboard`;
        }
        break;
      case 'payment':
        if(user?.role === 'partner') {
          return `/partner-dashboard/paymentRequests`;
        } else {
          return `/payments`;
        }
        break;
      case 'bike':
        return `/bike/${notification.relatedTo.id}`;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                    <div className="animate-pulse">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              </p>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="h-12 bg-gray-200 rounded w-2/5 mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
      </>
      
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen  pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  mt-28">
          {/* Header */}
          <div className="flex items-center justify-between my-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'reminder' | 'offer' | 'system' | 'partner' | 'payment' | 'owner')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="reminder">Reminders</option>
                <option value="offer">Offers</option>
                <option value="system">System</option>
                <option value="partner">Partner</option>
                <option value="payment">Payment</option>
                <option value="owner">Bike Owner</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const link = getNotificationLink(notification);
                const NotificationContent = (
                  <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${
                    notification.read 
                      ? 'border-gray-200 opacity-75' 
                      : 'border-emerald-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              notification.type === 'payment' ? 'bg-orange-100 text-orange-800' :
                              notification.type === 'partner' ? 'bg-purple-100 text-purple-800' :
                              notification.type === 'owner' ? 'bg-emerald-100 text-emerald-800' :
                              notification.type === 'offer' ? 'bg-green-100 text-green-800' :
                              notification.type === 'reminder' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.type}
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className="text-emerald-600 hover:text-emerald-700 text-xs"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                                className="text-red-600 hover:text-red-700 text-xs"
                                title="Delete notification"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div key={notification._id}>
                    {link ? (
                      <Link to={link} className="block">
                        {NotificationContent}
                      </Link>
                    ) : (
                      NotificationContent
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Load More Button (if needed) */}
          {filteredNotifications.length >= 100 && (
            <div className="text-center mt-8">
              <button
                onClick={fetchNotifications}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
        
      </div>
      <Footer/>
    </>
  );
};

export default NotificationsPage;