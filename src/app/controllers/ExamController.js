const Exam = require('../models/Exam')
const cloudinary = require('../../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class ExamController{

    static async list(req, res, next) {
        try {
            const exam = await Exam.findAll({
                raw: true, // Optional: Returns plain JavaScript objects
            });
            res.render('exam', { exam });
        } catch (error) {
            next(error);
        }
    }

    static create(req, res, next) {
        res.render('exam/createExam', {Exam})
    }

    static async created(req, res, next) {

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