
const express = require('express');
const router = express.Router();
const CourseController = require('../app/controllers/CourseController');
const authConfig = require('../middleware/authConfig');

// Import new route modules
const authRoutes = require('./auth');
const studentRoutes = require('./student');
const teacherRoutes = require('./teacherApi');
const notificationRoutes = require('./notifications');
const calendarRoutes = require('./calendar');
const fileRoutes = require('./files');
const adminRoutes = require('./admin');

// const rateLimit = require('express-rate-limit');    Consider using

// consider using csrf()
// const csrf = require('csurf');

// Legacy enrollment route
router.post('/enroll', authConfig.isAuthenticated, CourseController.enrollInClass);

// Mount API routes
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/notifications', notificationRoutes);
router.use('/calendar', calendarRoutes);
router.use('/files', fileRoutes);
router.use('/admin', adminRoutes);

module.exports = router;