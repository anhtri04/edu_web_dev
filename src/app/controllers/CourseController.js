const Class = require('../models/Class')
const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class CourseController{
    static show(req, res){
        res.render('course', {Class})
    }


    static async index(req, res, next) {
        try {
            const classes = await Class.findAll({
                raw: true, // Optional: Returns plain JavaScript objects
            });
            res.render('course', { classes });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { name, description } = req.body;
            let imageUrl = null;

            if (req.file) {
                const file = req.file;
                const publicId = `${uuidv4()}-${file.originalname.split('.')[0]}`;

                // Upload to Cloudinary
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { public_id: publicId, resource_type: 'image' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(file.buffer);
                });

                imageUrl = result.secure_url; // Cloudinary URL
            }

            const newClass = await Class.create({
                name,
                description,
                imageUrl,
            });

            res.redirect('/');
        } catch (error) {
            next(error);
        }
    }




}


    
module.exports = CourseController;