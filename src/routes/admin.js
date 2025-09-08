const express = require('express');
const router = express.Router();
const AdminController = require('../app/controllers/AdminController');
// For now, we'll use basic authentication - in production, implement proper admin authentication
const { isAuthenticated } = require('../middleware/authConfig');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Admin Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User Management
router.get('/students', AdminController.getAllStudents);
router.get('/teachers', AdminController.getAllTeachers);
router.post('/students', AdminController.createStudent);
router.post('/teachers', AdminController.createTeacher);
router.put('/users/:user_type/:user_id/status', AdminController.updateUserStatus);
router.delete('/users/:user_type/:user_id', AdminController.deleteUser);

// System Statistics
router.get('/stats', AdminController.getSystemStats);

// Bulk Operations
router.post('/notifications/bulk', AdminController.sendBulkNotification);

module.exports = router;