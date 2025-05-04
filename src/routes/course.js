const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const CourseController = require('../app/controllers/CourseController');

router.get('/add-course', CourseController.show);
router.post('/add-course', upload.single('image'), CourseController.create);
router.get('/:slug', CourseController.detail)
router.get('/:slug/dashboard', CourseController.dashboard)
router.get('/', CourseController.index);

module.exports = router;