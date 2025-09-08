const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment')
const Submission = require('../models/Submission')



class TeacherController {
    static show(req, res) {
        // Return JSON response with available models
        res.json({ message: 'Teacher detail course endpoint', models: ['Class', 'Enrollment', 'Submission'] });
    }
    
    static async getClassDashboard(req, res) {
    try {
        const { slug } = req.params;
        const teacherId = req.session.teacher.teacher_id;

        if (!req.session.teacher) {
            return res.status(401).redirect('/login');
        }

        // Fetch all teacher classes for dropdown
        const teacherClasses = await Class.findAll({
            where: { teacher_id: teacherId },
            attributes: ['class_id', 'class_name', 'semester'],
            raw: true
        });

        if (!teacherClasses.length) {
            return res.json({
                teacherClasses: [],
                class: null,
                students: [],
                exams: [],
                submissions: []
            });
        }

        // Fetch class details
        const classData = await Class.findOne({
            where: { slug, teacher_id: teacherId }
        });
        if (!classData) {
            return res.status(404).json({ message: 'Class not found or unauthorized' });
        }

        // Mark selected class
        teacherClasses.forEach(cls => {
            cls.selected = cls.class_id === classData.class_id;
        });

        // Fetch enrolled students
        const students = await Enrollment.findAll({
            where: { class_id: classData.class_id },
            include: [{
                model: Student,
                attributes: ['username', 'email']
            }],
            raw: true,
            nest: true
        }).then(results => results.map(r => ({
            username: r.Student.username,
            email: r.Student.email
        })));

        // Fetch exams
        const exams = await Exam.findAll({
            where: { class_id: classData.class_id },
            attributes: ['title', 'description', 'material', 'deadline', 'slug'],
            raw: true
        });

        // Fetch submissions
        const submissions = await Submission.findAll({
            include: [
                {
                    model: Exam,
                    attributes: ['title'],
                    where: { class_id: classData.class_id }
                },
                {
                    model: Student,
                    attributes: ['username']
                }
            ],
            attributes: ['uploading', 'comment', 'uploadDate'],
            raw: true,
            nest: true
        }).then(results => results.map(r => ({
            exam_title: r.Exam.title,
            student_username: r.Student.username,
            uploading: r.uploading,
            comment: r.comment || '-',
            uploadDate: r.uploadDate
        })));

        res.json({
            class: classData,
            teacherClasses,
            students,
            exams,
            submissions
        });
    } catch (error) {
        console.error('Dashboard error:', error.message, error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

static async getClassData(req, res) {
    try {
        const { classId } = req.params;
        const teacherId = req.session.student?.student_id;

        if (!req.session.student || !teacherId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Verify class belongs to teacher
        const classData = await Class.findOne({
            where: { class_id: classId, teacher_id: teacherId }
        });
        if (!classData) {
            return res.status(404).json({ error: 'Class not found or unauthorized' });
        }

        // Fetch enrolled students
        const students = await Enrollment.findAll({
            where: { class_id: classData.class_id },
            include: [{
                model: Student,
                attributes: ['username', 'email']
            }],
            raw: true,
            nest: true
        }).then(results => results.map(r => ({
            username: r.Student.username,
            email: r.Student.email
        })));

        // Fetch exams
        const exams = await Exam.findAll({
            where: { class_id: classData.class_id },
            attributes: ['title', 'description', 'material', 'deadline', 'slug'],
            raw: true
        });

        // Fetch submissions
        const submissions = await Submission.findAll({
            include: [
                {
                    model: Exam,
                    attributes: ['title'],
                    where: { class_id: classData.class_id }
                },
                {
                    model: Student,
                    attributes: ['username']
                }
            ],
            attributes: ['uploading', 'comment', 'uploadDate'],
            raw: true,
            nest: true
        }).then(results => results.map(r => ({
            exam_title: r.Exam.title,
            student_username: r.Student.username,
            uploading: r.uploading,
            comment: r.comment || '-',
            uploadDate: r.uploadDate
        })));

        res.json({
            students,
            exams,
            submissions
        });
    } catch (error) {
        console.error('Class data error:', error.message, error.stack);
        res.status(500).json({ error: 'Server error' });
    }
}
}
module.exports = TeacherController;