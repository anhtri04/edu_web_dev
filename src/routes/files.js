const express = require('express');
const router = express.Router();
const FileController = require('../app/controllers/FileController');
const { isAuthenticated } = require('../middleware/authConfig');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for educational purposes
    cb(null, true);
  }
});

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Upload single file
router.post('/upload', upload.single('file'), FileController.uploadFile);

// Upload multiple files
router.post('/upload/bulk', upload.array('files', 10), FileController.bulkUpload);

// Get files with filtering options
router.get('/', FileController.getFiles);

// Get file by ID
router.get('/:id', FileController.getFileById);

// Download file (increment download count)
router.get('/:id/download', FileController.downloadFile);

// Update file metadata
router.put('/:id', FileController.updateFile);

// Delete file
router.delete('/:id', FileController.deleteFile);

// Get files by folder
router.get('/folder/:folder_path', FileController.getFilesByFolder);

// Get file statistics
router.get('/stats/summary', FileController.getFileStats);

module.exports = router;