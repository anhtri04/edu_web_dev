const express = require('express');
const router = express.Router();
const CourseController = require('../app/controllers/CourseController');
const authConfig = require('../middleware/authConfig');


router.get('/:slug', authConfig.isAuthenticated, CourseController.detail)
router.get('/:slug/dashboard', authConfig.isAuthenticated, CourseController.dashboard) //conflict with teacher/dashboard!!!!
router.get('/', authConfig.isAuthenticated, CourseController.index);
router.post('/', authConfig.isAuthenticated, CourseController.enrollInClass);


module.exports = router;