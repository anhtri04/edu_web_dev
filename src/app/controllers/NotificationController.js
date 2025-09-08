const { Notification } = require('../models');
const { Op } = require('sequelize');

class NotificationController {
  // Get notifications for a user
  static async getUserNotifications(req, res) {
    try {
      const { user_id, user_type } = req.query;
      const { page = 1, limit = 20, unread_only = false } = req.query;
      
      const offset = (page - 1) * limit;
      
      const whereClause = {
        user_id: user_id,
        user_type: user_type
      };
      
      if (unread_only === 'true') {
        whereClause.is_read = false;
      }
      
      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });
      
      res.json({
        success: true,
        data: notifications.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(notifications.count / limit),
          total_items: notifications.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  // Create a new notification
  static async createNotification(req, res) {
    try {
      const {
        user_id,
        user_type,
        title,
        message,
        type = 'info',
        related_id,
        related_type
      } = req.body;

      const notification = await Notification.create({
        user_id,
        user_type,
        title,
        message,
        type,
        related_id,
        related_type
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error.message
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.update({ is_read: true });

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: error.message
      });
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(req, res) {
    try {
      const { user_id, user_type } = req.body;

      await Notification.update(
        { is_read: true },
        {
          where: {
            user_id: user_id,
            user_type: user_type,
            is_read: false
          }
        }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notifications',
        error: error.message
      });
    }
  }

  // Get unread notification count
  static async getUnreadCount(req, res) {
    try {
      const { user_id, user_type } = req.query;

      const count = await Notification.count({
        where: {
          user_id: user_id,
          user_type: user_type,
          is_read: false
        }
      });

      res.json({
        success: true,
        data: { unread_count: count }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }

  // Bulk create notifications (for announcements to multiple users)
  static async createBulkNotifications(req, res) {
    try {
      const { recipients, title, message, type = 'announcement', related_id, related_type } = req.body;

      const notifications = recipients.map(recipient => ({
        user_id: recipient.user_id,
        user_type: recipient.user_type,
        title,
        message,
        type,
        related_id,
        related_type
      }));

      const createdNotifications = await Notification.bulkCreate(notifications);

      res.status(201).json({
        success: true,
        message: `${createdNotifications.length} notifications created successfully`,
        data: { count: createdNotifications.length }
      });
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create bulk notifications',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;