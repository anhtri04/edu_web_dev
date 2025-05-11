const express = require('express');
const router = express.Router({ mergeParams: true });
const {uploadFiles} = require('../middleware/multerConfig');
const ExamController = require('../app/controllers/ExamController')
const authConfig = require('../middleware/authConfig');

router.get('/', authConfig.isAuthenticated, ExamController.list)
router.get('/add-exam', authConfig.teachAuthenticated, ExamController.create)
router.post('/add-exam', authConfig.teachAuthenticated, uploadFiles.single('material'), ExamController.created)
router.get('/submit', authConfig.isAuthenticated, ExamController.submit)
router.post('/submit', ExamController.submitted)


module.exports = router;

















