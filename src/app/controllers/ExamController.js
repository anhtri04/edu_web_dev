const Exam = require('../models/Exam');
const Class = require('../models/Class');
const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class ExamController{

    static async list(req, res, next) {
        try {
            console.log('GET /course/:slug/exam reached - Fetching all exams');
            const slug = req.params.slug;
            const course = await Class.findOne({ where: { slug } });
            if (!course) {
                throw new Error('Course not found');
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
        res.render('exam/createExam', {Exam});
    }

    static async created(req, res, next) {
        try {
                    const { exam_id, title, description, teacher_id, slug, deadline, class_id } = req.body;
                    let material = null;
                    
                    // Validate required fields
                    if ( !title || !slug) {
                        throw new Error('Title, and Slug are required');
                    }
        
                    if (req.file) {
                        const file = req.file;
                        const publicId = `${uuidv4()}-${file.originalname.split('.')[0]}`;
        
                        // Upload to Cloudinary
                        const result = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { public_id: publicId, resource_type: 'file' },
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
                        exam_id,
                        title,
                        description,
                        teacher_id,
                        slug,
                        deadline,
                        class_id,
                        material
                    });
        
                    res.redirect(`/course/exam/${slug}`);
        
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