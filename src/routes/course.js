const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const CourseController = require('../app/controllers/CourseController');






router.get('/', CourseController.index);
router.get('/course', CourseController.show);
router.post('/course', upload.single('image'), CourseController.create);

module.exports = router;