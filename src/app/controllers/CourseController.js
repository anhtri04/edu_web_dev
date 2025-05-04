const Class = require('../models/Class')
const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class CourseController{

    

    static async detail(req, res, next) {
        try {
            const classes = await Class.findOne({
                where: { slug: req.params.slug }
            });

            if (!classes) {
                return res.status(404).send('Course not found');
              }
              const plainClasses = classes.toJSON(); // to deal with Handlebars' strict prototype access restrictions 
              res.render('courses/detail', { classes: plainClasses });
        } catch (error) {
            next(error);
        }
    }

    static show(req, res){
        res.render('courses/createCourse', {Class})
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
            const { class_id, class_name, description, semester, teacher, slug } = req.body;
            let imageUrl = null;
            
            // Validate required fields
            if ( !class_name || !slug) {
                throw new Error('Class Name, and Slug are required');
            }

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
                class_id,
                class_name,
                description,
                semester,
                teacher,
                imageUrl,
                slug
            });

            res.redirect(`/course/${slug}`);

        } catch (error) {
            next(error);
        }
    }

    static async dashboard() {
        
    }


}


    
module.exports = CourseController;