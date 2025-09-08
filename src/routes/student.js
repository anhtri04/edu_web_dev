const express = require('express');
const router = express.Router();
const StudentController = require('../app/controllers/StudentController');
const { studentAuthenticated } = require('../middleware/authConfig');

// Apply student authentication middleware to all routes
router.use(studentAuthenticated);

// Student Dashboard Routes
router.get('/:student_id/dashboard', StudentController.getDashboard);

// Course Management Routes
router.get('/:student_id/courses', StudentController.getEnrolledCourses);
router.get('/:student_id/courses/available', StudentController.getAvailableCourses);
router.post('/:student_id/courses/enroll', StudentController.enrollInCourse);

// Grade Routes
router.get('/:student_id/grades', StudentController.getGrades);

// Submission Routes
router.get('/:student_id/submissions', StudentController.getSubmissions);

// Profile Routes
router.put('/:student_id/profile', StudentController.updateProfile);

// Calendar Routes
router.get('/:student_id/calendar', StudentController.getCalendarEvents);

// File Routes
router.get('/:student_id/files', StudentController.getFiles);

module.exports = router;