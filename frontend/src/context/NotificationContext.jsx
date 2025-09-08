import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchUnreadCount();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/notifications', {
        params: {
          user_id: user.id,
          user_type: user.role,
          page,
          limit
        },
        withCredentials: true
      });

      if (response.data.success) {
        if (page === 1) {
          setNotifications(response.data.data);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('http://localhost:3000/api/notifications/unread-count', {
        params: {
          user_id: user.id,
          user_type: user.role
        },
        withCredentials: true
      });

      if (response.data.success) {
        setUnreadCount(response.data.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/notifications/${notificationId}/read`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.notification_id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const response = await axios.put('http://localhost:3000/api/notifications/mark-all-read', {
        user_id: user.id,
        user_type: user.role
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/notifications/${notificationId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        const deletedNotification = notifications.find(n => n.notification_id === notificationId);
        setNotifications(prev => 
          prev.filter(notif => notif.notification_id !== notificationId)
        );
        
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const showNotification = (title, message, type = 'info') => {
    // For local notifications (success messages, errors, etc.)
    const tempNotification = {
      notification_id: Date.now(),
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
      isLocal: true
    };
    
    addNotification(tempNotification);
    
    // Auto-remove local notifications after 5 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.notification_id !== tempNotification.notification_id)
      );
    }, 5000);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    showNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};