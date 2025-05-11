
const express = require('express');
const router = express.Router();
const CourseController = require('../app/controllers/CourseController');
const authConfig = require('../middleware/authConfig');

// const rateLimit = require('express-rate-limit');    Consider using

// consider using csrf()
// const csrf = require('csurf');

router.post('/enroll', authConfig.isAuthenticated, CourseController.enrollInClass)





module.exports = router;