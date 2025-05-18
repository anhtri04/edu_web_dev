const Exam = require('../models/Exam');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Submission = require('../models/Submission');

const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class ExamController{
    static async detail(req, res, next){
        try{
            // const classes = await Class.findOne({
            //     where: { slug: req.params.slug }
            // });
            // const exams = await Exam.findOne({
            //     where: {
            //         class_id: classes.class_id
            //     }           
            // });
            
            res.render('exam/examDetail');
        } catch (error){
            next(error);
        }
    }

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
            const coursePlain = course.toJSON();
            res.render('exam/exam', { exams, course: coursePlain });
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

    static async submitted(req, res, next) {
        try {
            const {exam_id, comment, uploadDate } = new req.body;
            let uploading = null;

            if (!req.session.student) {
                        throw new Error('Student session not found or has expired. Please log in again.');
                    }
            let studentId;
            if (typeof req.session.teacher === 'object') {
                studentId = req.session.student.id || req.session.student.student_id;
            } else {
                studentId = req.session.student; // In case it's directly the ID
            }
                    
            if (!studentId) {
                throw new Error('Student ID not found in session');
            }
                    
            console.log('Using student ID:', studentId); // Debug student ID

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
        
                        uploading = result.secure_url; // Cloudinary URL
                    }        
            
            const newExam = await Exam.create({
                        
                        student_id: studentId,
                        comment,
                        uploadDate,
                        class_id: classId,
                        uploading
                    });
        
                    res.redirect(`/course/${courseSlug}/exam/`);

        } catch(error){
            next(error);
        }
    }   

}


module.exports = ExamController;