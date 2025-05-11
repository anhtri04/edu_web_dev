const multer = require('multer');

const storage = multer.memoryStorage();

// Middleware for image uploads (used for createCourse)
const uploadImages = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, JPG, PNG, GIF) are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit to 5MB
    },
});

// Middleware for file uploads (used for createExam)
const uploadFiles = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf', // PDF
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/zip', // ZIP
            'application/x-rar-compressed', // RAR
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);  
        } else {
            cb(new Error('Only files (PDF, DOC, DOCX, ZIP, RAR) are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit to 5MB
    },
});

module.exports = { uploadImages, uploadFiles };