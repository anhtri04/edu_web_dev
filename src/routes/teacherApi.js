const express = require('express');
const router = express.Router();
const TeacherApiController = require('../app/controllers/TeacherApiController');
const authConfig = require('../middleware/authConfig');

// Apply teacher authentication middleware to all routes
router.use(authConfig.teachAuthenticated);

// Teacher Dashboard API
router.get('/:teacherId/dashboard', TeacherApiController.getDashboard);

// Teacher Classes API
router.get('/:teacherId/classes', TeacherApiController.getClasses);

// Teacher Students API  
router.get('/:teacherId/students', TeacherApiController.getStudents);

// Teacher Exams API
router.get('/:teacherId/exams', TeacherApiController.getExams);

// Teacher Analytics API
router.get('/:teacherId/analytics', TeacherApiController.getAnalytics);

// Teacher Class Management API
router.post('/:teacherId/classes', TeacherApiController.createClass);
router.put('/:teacherId/classes/:classId', TeacherApiController.updateClass);

// Teacher Exam Management API
router.post('/:teacherId/exams', TeacherApiController.createExam);

// Teacher Grading API
router.post('/:teacherId/grade/:submissionId', TeacherApiController.gradeSubmission);

// Teacher File Management API
router.get('/:teacherId/files', TeacherApiController.getFiles);

module.exports = router;