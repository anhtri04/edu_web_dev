const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const ExamController = require('../app/controllers/ExamController')

router.get('/', ExamController.list)
router.get('/add-exam', ExamController.create)
router.post('/add-exam', ExamController.created)
router.get('/submit', ExamController.submit)
router.post('/submit', ExamController.submitted)


module.exports = router;