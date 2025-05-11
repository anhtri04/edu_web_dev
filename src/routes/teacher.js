const express = require('express');
const router = express.Router();

const {uploadImages} = require('../middleware/multerConfig');
const WelcomeController = require('../app/controllers/WelcomeController');
const authConfig = require('../middleware/authConfig');
const CourseController = require('../app/controllers/CourseController');

router.get('/dashboard', authConfig.teachAuthenticated, WelcomeController.dashboard);
router.get('/account', authConfig.teachAuthenticated, WelcomeController.showAccount);
router.get('/course', authConfig.teachAuthenticated, CourseController.index );
router.get('/course/add-course', authConfig.teachAuthenticated, CourseController.show);
router.post('/course/add-course', uploadImages.single('image'), CourseController.create);


module.exports = router;