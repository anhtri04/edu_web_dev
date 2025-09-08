import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Bell, 
  Check, 
  CheckCircle, 
  X, 
  Trash2, 
  Filter, 
  Search,
  RefreshCw,
  AlertCircle,
  Info,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Settings,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all'); // all, system, assignment, grade, announcement, exam
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Fetch notifications with polling for real-time updates
  const { data: notificationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', user?.id, selectedFilter, selectedType],
    queryFn: () => notificationService.getUserNotifications(user?.id, {
      filter: selectedFilter !== 'all' ? selectedFilter : undefined,
      type: selectedType !== 'all' ? selectedType : undefined
    }),
    enabled: !!user?.id,
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    select: (response) => response.data.data
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notificationCount', user?.id],
    queryFn: () => notificationService.getUnreadCount(user?.id),
    enabled: !!user?.id,
    refetchInterval: 15000, // Poll every 15 seconds
    select: (response) => response.data.data
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
      setSelectedNotifications(prev => prev.filter(id => id !== arguments[0]));
    }
  });

  // Real-time updates using visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading notifications. Please try again later.
      </div>
    );
  }

  const { notifications = [], total_count = 0, unread_count = 0 } = notificationsData || {};
  const { count: globalUnreadCount = 0 } = unreadCountData || {};

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system':
        return Settings;
      case 'assignment':
        return FileText;
      case 'grade':
        return CheckCircle;
      case 'announcement':
        return Bell;
      case 'exam':
        return BookOpen;
      case 'calendar':
        return Calendar;
      case 'user':
        return Users;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'system':
        return 'text-gray-500 bg-gray-100';
      case 'assignment':
        return 'text-blue-500 bg-blue-100';
      case 'grade':
        return 'text-green-500 bg-green-100';
      case 'announcement':
        return 'text-purple-500 bg-purple-100';
      case 'exam':
        return 'text-red-500 bg-red-100';
      case 'calendar':
        return 'text-yellow-500 bg-yellow-100';
      case 'user':
        return 'text-indigo-500 bg-indigo-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.notification_id));
    }
  };

  const handleBulkDelete = async () => {
    for (const notificationId of selectedNotifications) {
      await handleDeleteNotification(notificationId);
    }
    setSelectedNotifications([]);
  };

  const handleBulkMarkAsRead = async () => {
    for (const notificationId of selectedNotifications) {
      const notification = notifications.find(n => n.notification_id === notificationId);
      if (notification && !notification.is_read) {
        await handleMarkAsRead(notificationId);
      }
    }
    setSelectedNotifications([]);
  };

  const NotificationCard = ({ notification }) => {
    const IconComponent = getNotificationIcon(notification.type);
    const colorClasses = getNotificationColor(notification.type);
    const isSelected = selectedNotifications.includes(notification.notification_id);

    return (
      <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        !notification.is_read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectNotification(notification.notification_id)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h3>
                <p className={`text-sm ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'} mt-1`}>
                  {notification.message}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-xs text-gray-400">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
                    {notification.type}
                  </span>
                  {!notification.is_read && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></div>
                      New
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.notification_id)}
                    disabled={markAsReadMutation.isLoading}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Mark as read"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification.notification_id)}
                  disabled={deleteNotificationMutation.isLoading}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Notifications
              {globalUnreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {globalUnreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-gray-600">Stay updated with your latest activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {unread_count > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Notifications</dt>
                  <dd className="text-lg font-medium text-gray-900">{total_count}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                  <dd className="text-lg font-medium text-gray-900">{unread_count}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Read</dt>
                  <dd className="text-lg font-medium text-gray-900">{total_count - unread_count}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search notifications..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="system">System</option>
                <option value="assignment">Assignment</option>
                <option value="grade">Grade</option>
                <option value="announcement">Announcement</option>
                <option value="exam">Exam</option>
                <option value="calendar">Calendar</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Mark Read
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard key={notification.notification_id} notification={notification} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedFilter !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'You\'re all caught up! New notifications will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;