const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit to 5MB
    },
});

module.exports = upload;