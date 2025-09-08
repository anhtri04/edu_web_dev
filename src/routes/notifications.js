const express = require('express');
const router = express.Router();
const NotificationController = require('../app/controllers/NotificationController');
const { isAuthenticated } = require('../middleware/authConfig');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get notifications for a user
router.get('/', NotificationController.getUserNotifications);

// Create a new notification
router.post('/', NotificationController.createNotification);

// Mark notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read for a user
router.put('/mark-all-read', NotificationController.markAllAsRead);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Delete a notification
router.delete('/:id', NotificationController.deleteNotification);

// Bulk create notifications (for system announcements)
router.post('/bulk', NotificationController.createBulkNotifications);

module.exports = router;