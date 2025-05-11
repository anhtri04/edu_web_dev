const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment')
const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');


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
        res.render('courses/createCourse', {Class});
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
            const { class_id, class_name, description, semester, password, slug } = req.body;
            
            //Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            let imageUrl = null;
            
            // Validate required fields
            if ( !class_name || !slug) {
                throw new Error('Class Name, and Slug are required');
            }

            // Check authentication
                    if (!req.session.teacher) {
                        throw new Error('Teacher session not found. Please log in again.');
                    }

                    // Extract teacher_id properly based on your session structure
                    let teacherId;
                    if (typeof req.session.teacher === 'object') {
                        teacherId = req.session.teacher.id || req.session.teacher.teacher_id;
                    } else {
                        teacherId = req.session.teacher; // In case it's directly the ID
                    }
                    
                    if (!teacherId) {
                        throw new Error('Teacher ID not found in session');
                    }
                    
                    console.log('Using teacher ID:', teacherId); // Debug teacher ID

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
                teacher_id: teacherId,
                imageUrl,
                slug,
                password: hashedPassword
            });

            res.redirect(`/course/${slug}`);

        } catch (error) {
            next(error);
        }
    }

    static async dashboard() {
        
    }
    
    static async enrollInClass(req, res) {
        try {
            const { classId, password } = req.body;
            const studentId = req.session.student.student_id; // Assuming user is authenticated and ID is available

            // Find class
            const classData = await Class.findByPk(classId, { attributes: ['password', 'slug'] });
            if (!classData) {
                return res.status(404).json({ error: sanitizeHtml('Class not found') });
            }

            // Verify password (assuming passwords are hashed in the database)
            const isPasswordValid = await bcrypt.compare(password, classData.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // Check if already enrolled
            const existingEnrollment = await Enrollment.findOne({
                where: { student_id: studentId, class_id: classId }
            });
            if (existingEnrollment) {
                return res.status(400).json({ error: 'Already enrolled in this class' });
            }

            // Create enrollment
            const newEnroll = await Enrollment.create({
                student_id: studentId,
                class_id: classId
            });

            res.redirect(`/course/${classData.slug}`);
        } catch (error) {
            console.error('Enrollment error:', error);
            res.status(500).json({ error: 'Server error' });
        }

        }

}


    
module.exports = CourseController;