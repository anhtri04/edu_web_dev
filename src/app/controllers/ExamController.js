const Exam = require('../models/Exam');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class ExamController{

    static async list(req, res, next) {
        try {
            const slug = req.params.slug;
            const course = await Class.findOne({ where: { slug } });
            if (!course) {
                return res.status(404).render('error', { message: 'Course not found' });
            }
            const exams = await Exam.findAll({
                where: { class_id: course.class_id },
                raw: true,
            });
            res.render('exam/exam', { exams, course });
        } catch (error) {
            console.error('List error:', error.message);
            next(error);
        }
    }

    static create(req, res, next) {

        // Get the course slug from the URL
        const courseSlug = req.params.slug;
        res.render('exam/createExam', {Exam, courseSlug});
    }

    static async created(req, res, next) {
        try {       console.log('Session data:', req.session); // Debug session
                    console.log('Teacher data:', req.session.teacher); // Debug teacher object

                    const { title, description, slug, deadline } = req.body;
                    const courseSlug = req.params.slug; // Get course slug from URL
                    
                    
                    // Validate required fields
                    if ( !title || !slug) {
                        throw new Error('Title, and Slug are required');
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
                    
                    // Find the class_id based on the course slug
                    const course = await Class.findOne({ where: { slug: courseSlug } });
                    if (!course) {
                        throw new Error('Course not found');
                    }
                    
                    const classId = course.class_id;
                    if (!classId) {
                        throw new Error('No class associated with this course');
                    }
                    
                    let material = null;
                    
                    // Handle file upload
                    if (req.file) {
                        const file = req.file;

                        // Validate file type
                        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-rar-compressed'];
                        if (!allowedTypes.includes(file.mimetype)) {
                            throw new Error('Invalid file type. Only PDF, DOC, DOCX, ZIP, and RAR are allowed.');
                        }

                        const publicId = `${uuidv4()}-${file.originalname.split('.')[0]}`;
        
                        // Upload to Cloudinary
                        const result = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { public_id: publicId, resource_type: 'auto' },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            stream.end(file.buffer);
                        });
        
                        material = result.secure_url; // Cloudinary URL
                    }
        
                    const newExam = await Exam.create({
                        title,
                        description,
                        teacher_id: teacherId,
                        slug,
                        deadline,
                        class_id: classId,
                        material
                    });
        
                    res.redirect(`/course/${courseSlug}/exam/`);
        
                } catch (error) {
                    next(error);
                }
    }

    static form() {

    }

    static update() {

    }

    static submit() {

    }

    static async submitted() {

    }   

}


module.exports = ExamController;