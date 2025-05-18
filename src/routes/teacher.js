const express = require('express');
const router = express.Router();

const {uploadImages} = require('../middleware/multerConfig');
const WelcomeController = require('../app/controllers/WelcomeController');
const authConfig = require('../middleware/authConfig');
const CourseController = require('../app/controllers/CourseController');
const TeacherController = require('../app/controllers/TeacherController')


router.get('/account', authConfig.teachAuthenticated, WelcomeController.showAccount);
router.get('/course', authConfig.teachAuthenticated, CourseController.index );
router.get('/course/add-course', authConfig.teachAuthenticated, CourseController.show);
router.post('/course/add-course', uploadImages.single('image'), CourseController.create);



//dashboard
router.get('/dashboard', authConfig.teachAuthenticated, WelcomeController.dashboard);
router.post('/enroll', authConfig.teachAuthenticated, CourseController.enrollInClass);
router.get('/course/:slug', authConfig.teachAuthenticated, TeacherController.getClassDashboard);
router.get('/course/data/:classId', authConfig.teachAuthenticated, TeacherController.getClassData);
router.get('/management', authConfig.teachAuthenticated, TeacherController.show);

module.exports = router;