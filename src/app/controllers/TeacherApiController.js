const { Teacher, Student, Class, Exam, Submission, Enrollment, Notification, Grading } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class TeacherApiController {
  
  // GET /api/teacher/:teacherId/dashboard
  static async getDashboard(req, res) {
    try {
      const { teacherId } = req.params;
      
      // Verify teacher exists and is authenticated
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({ 
          success: false, 
          message: 'Teacher not found' 
        });
      }

      // Get teacher's classes count
      const classesCount = await Class.count({ 
        where: { teacher_id: teacherId } 
      });

      // Get total students across all teacher's classes
      const classIds = await Class.findAll({
        where: { teacher_id: teacherId },
        attributes: ['class_id'],
        raw: true
      });
      
      const classIdValues = classIds.map(cls => cls.class_id);
      const studentsCount = classIdValues.length > 0 ? await Enrollment.count({
        where: { class_id: classIdValues }
      }) : 0;

      // Get recent exams
      const recentExams = await Exam.findAll({
        include: [{
          model: Class,
          where: { teacher_id: teacherId },
          attributes: ['class_name']
        }],
        order: [['deadline', 'DESC']],
        limit: 5,
        attributes: ['exam_id', 'title', 'deadline']
      });

      // Get total submissions count (simplified for now)
      const pendingSubmissions = await Submission.count({
        include: [{
          model: Exam,
          include: [{
            model: Class,
            where: { teacher_id: teacherId },
            attributes: []
          }],
          attributes: []
        }]
      });

      res.json({
        success: true,
        data: {
          teacher: {
            id: teacher.teacher_id,
            name: teacher.teacher_name,
            email: teacher.email,
            department: teacher.department
          },
          stats: {
            totalClasses: classesCount,
            totalStudents: studentsCount,
            pendingSubmissions: pendingSubmissions,
            recentExams: recentExams.length
          },
          recentExams: recentExams.map(exam => ({
            id: exam.exam_id,
            title: exam.title,
            className: exam.Class.class_name,
            deadline: exam.deadline
          }))
        }
      });

    } catch (error) {
      console.error('Teacher dashboard API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load dashboard data' 
      });
    }
  }

  // GET /api/teacher/:teacherId/classes
  static async getClasses(req, res) {
    try {
      const { teacherId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      const offset = (page - 1) * limit;
      
      const { count, rows: classes } = await Class.findAndCountAll({
        where: { teacher_id: teacherId },
        attributes: [
          'class_id', 'class_name', 'description', 'semester', 
          'max_students', 'is_active', 'created_at', 'slug'
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      // Get enrollment count for each class
      const classesWithCounts = await Promise.all(
        classes.map(async (cls) => {
          const enrollmentCount = await Enrollment.count({
            where: { class_id: cls.class_id }
          });
          
          return {
            id: cls.class_id,
            name: cls.class_name,
            description: cls.description,
            semester: cls.semester,
            slug: cls.slug,
            maxStudents: cls.max_students,
            currentStudents: enrollmentCount,
            isActive: cls.is_active,
            createdAt: cls.created_at
          };
        })
      );

      res.json({
        success: true,
        data: {
          classes: classesWithCounts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalClasses: count,
            hasNextPage: page * limit < count,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Teacher classes API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load classes' 
      });
    }
  }

  // GET /api/teacher/:teacherId/students
  static async getStudents(req, res) {
    try {
      const { teacherId } = req.params;
      const { classId, page = 1, limit = 20 } = req.query;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      const offset = (page - 1) * limit;
      let whereCondition = {};
      
      if (classId) {
        // Get students from specific class
        whereCondition = { class_id: classId };
      } else {
        // Get students from all teacher's classes
        const teacherClassIds = await Class.findAll({
          where: { teacher_id: teacherId },
          attributes: ['class_id'],
          raw: true
        });
        const classIds = teacherClassIds.map(cls => cls.class_id);
        if (classIds.length === 0) {
          return res.json({
            success: true,
            data: {
              students: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalStudents: 0,
                hasNextPage: false,
                hasPrevPage: false
              }
            }
          });
        }
        whereCondition = { class_id: classIds };
      }

      const { count, rows: enrollments } = await Enrollment.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Student,
            attributes: ['student_id', 'student_name', 'email', 'profile_picture', 'enrollment_date']
          },
          {
            model: Class,
            attributes: ['class_id', 'class_name']
          }
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [[Student, 'student_name', 'ASC']]
      });

      const students = enrollments.map(enrollment => ({
        id: enrollment.Student.student_id,
        name: enrollment.Student.student_name,
        email: enrollment.Student.email,
        profilePicture: enrollment.Student.profile_picture,
        enrollmentDate: enrollment.Student.enrollment_date,
        class: {
          id: enrollment.Class.class_id,
          name: enrollment.Class.class_name
        }
      }));

      res.json({
        success: true,
        data: {
          students,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalStudents: count,
            hasNextPage: page * limit < count,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Teacher students API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load students' 
      });
    }
  }

  // GET /api/teacher/:teacherId/exams
  static async getExams(req, res) {
    try {
      const { teacherId } = req.params;
      const { classId, page = 1, limit = 10 } = req.query;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      const offset = (page - 1) * limit;
      let whereCondition = {};
      
      if (classId) {
        whereCondition = { class_id: classId };
      }

      const { count, rows: exams } = await Exam.findAndCountAll({
        where: whereCondition,
        include: [{
          model: Class,
          where: { teacher_id: teacherId },
          attributes: ['class_id', 'class_name']
        }],
        attributes: ['exam_id', 'title', 'description', 'deadline', 'slug'],
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['deadline', 'DESC']]
      });

      const examsWithSubmissions = await Promise.all(
        exams.map(async (exam) => {
          const submissionCount = await Submission.count({
            where: { exam_id: exam.exam_id }
          });
          
          return {
            id: exam.exam_id,
            title: exam.title,
            description: exam.description,
            deadline: exam.deadline,
            slug: exam.slug,
            submissionCount,
            class: {
              id: exam.Class.class_id,
              name: exam.Class.class_name
            }
          };
        })
      );

      res.json({
        success: true,
        data: {
          exams: examsWithSubmissions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalExams: count,
            hasNextPage: page * limit < count,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Teacher exams API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load exams' 
      });
    }
  }

  // GET /api/teacher/:teacherId/analytics
  static async getAnalytics(req, res) {
    try {
      const { teacherId } = req.params;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      // Get classes with enrollment stats
      const classes = await Class.findAll({
        where: { teacher_id: teacherId },
        attributes: ['class_id', 'class_name', 'max_students'],
        raw: true
      });

      // Get enrollment counts for each class
      const classStats = await Promise.all(
        classes.map(async (cls) => {
          const enrollmentCount = await Enrollment.count({
            where: { class_id: cls.class_id }
          });
          
          return {
            class_id: cls.class_id,
            class_name: cls.class_name,
            max_students: cls.max_students,
            enrollment_count: enrollmentCount
          };
        })
      );

      // Get submission statistics
      const submissionStats = await Submission.findAll({
        include: [{
          model: Exam,
          include: [{
            model: Class,
            where: { teacher_id: teacherId },
            attributes: ['class_name']
          }],
          attributes: ['title']
        }],
        attributes: [
          'exam_id',
          [Submission.sequelize.fn('COUNT', '*'), 'submission_count']
        ],
        group: ['exam_id'],
        raw: true
      });

      res.json({
        success: true,
        data: {
          classEnrollments: classStats.map(stat => ({
            classId: stat.class_id,
            className: stat.class_name,
            maxStudents: stat.max_students,
            currentEnrollments: stat.enrollment_count,
            enrollmentPercentage: stat.max_students > 0 
              ? Math.round(stat.enrollment_count / stat.max_students * 100) 
              : 0
          })),
          submissionStats: submissionStats,
          summary: {
            totalClasses: classStats.length,
            totalEnrollments: classStats.reduce((sum, stat) => sum + stat.enrollment_count, 0),
            averageClassSize: classStats.length > 0 
              ? Math.round(classStats.reduce((sum, stat) => sum + stat.enrollment_count, 0) / classStats.length)
              : 0
          }
        }
      });

    } catch (error) {
      console.error('Teacher analytics API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load analytics' 
      });
    }
  }

  // POST /api/teacher/:teacherId/classes
  static async createClass(req, res) {
    try {
      const { teacherId } = req.params;
      const { class_name, description, semester, max_students, password } = req.body;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      // Validate required fields
      if (!class_name || !semester || !password) {
        return res.status(400).json({
          success: false,
          message: 'Class name, semester, and password are required'
        });
      }

      // Generate unique class ID
      const lastClass = await Class.findOne({
        order: [['class_id', 'DESC']]
      });
      const class_id = lastClass ? lastClass.class_id + 1 : 1;

      // Generate slug from class name
      const slug = class_name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim() + '-' + crypto.randomBytes(4).toString('hex');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create class
      const newClass = await Class.create({
        class_id,
        class_name,
        description: description || '',
        semester,
        teacher_id: teacherId,
        slug,
        password: hashedPassword,
        max_students: max_students || 50,
        is_active: true
      });

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: {
          id: newClass.class_id,
          name: newClass.class_name,
          description: newClass.description,
          semester: newClass.semester,
          slug: newClass.slug,
          maxStudents: newClass.max_students,
          isActive: newClass.is_active,
          createdAt: newClass.created_at
        }
      });

    } catch (error) {
      console.error('Create class API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create class' 
      });
    }
  }

  // PUT /api/teacher/:teacherId/classes/:classId
  static async updateClass(req, res) {
    try {
      const { teacherId, classId } = req.params;
      const { class_name, description, semester, max_students, is_active } = req.body;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      // Find class and verify ownership
      const existingClass = await Class.findOne({
        where: { 
          class_id: classId, 
          teacher_id: teacherId 
        }
      });

      if (!existingClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found or unauthorized'
        });
      }

      // Update class
      const updatedClass = await existingClass.update({
        class_name: class_name || existingClass.class_name,
        description: description !== undefined ? description : existingClass.description,
        semester: semester || existingClass.semester,
        max_students: max_students !== undefined ? max_students : existingClass.max_students,
        is_active: is_active !== undefined ? is_active : existingClass.is_active
      });

      res.json({
        success: true,
        message: 'Class updated successfully',
        data: {
          id: updatedClass.class_id,
          name: updatedClass.class_name,
          description: updatedClass.description,
          semester: updatedClass.semester,
          maxStudents: updatedClass.max_students,
          isActive: updatedClass.is_active,
          updatedAt: updatedClass.updated_at
        }
      });

    } catch (error) {
      console.error('Update class API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update class' 
      });
    }
  }

  // POST /api/teacher/:teacherId/exams
  static async createExam(req, res) {
    try {
      const { teacherId } = req.params;
      const { title, description, class_id, deadline, material } = req.body;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      // Validate required fields
      if (!title || !class_id || !deadline) {
        return res.status(400).json({
          success: false,
          message: 'Title, class ID, and deadline are required'
        });
      }

      // Verify class belongs to teacher
      const classExists = await Class.findOne({
        where: { 
          class_id: class_id, 
          teacher_id: teacherId 
        }
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found or unauthorized'
        });
      }

      // Generate unique exam ID
      const lastExam = await Exam.findOne({
        order: [['exam_id', 'DESC']]
      });
      const exam_id = lastExam ? lastExam.exam_id + 1 : 1;

      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim() + '-' + crypto.randomBytes(4).toString('hex');

      // Create exam
      const newExam = await Exam.create({
        exam_id,
        title,
        description: description || '',
        class_id,
        deadline: new Date(deadline),
        material: material || '',
        slug
      });

      res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        data: {
          id: newExam.exam_id,
          title: newExam.title,
          description: newExam.description,
          classId: newExam.class_id,
          deadline: newExam.deadline,
          material: newExam.material,
          slug: newExam.slug,
          createdAt: newExam.created_at
        }
      });

    } catch (error) {
      console.error('Create exam API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create exam' 
      });
    }
  }

  // POST /api/teacher/:teacherId/grade/:submissionId
  static async gradeSubmission(req, res) {
    try {
      const { teacherId, submissionId } = req.params;
      const { grade, feedback } = req.body;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      // Validate grade
      if (grade === undefined || grade < 0 || grade > 100) {
        return res.status(400).json({
          success: false,
          message: 'Grade must be between 0 and 100'
        });
      }

      // Find submission and verify teacher owns the related class
      const submission = await Submission.findOne({
        where: { submission_id: submissionId },
        include: [{
          model: Exam,
          include: [{
            model: Class,
            where: { teacher_id: teacherId },
            attributes: ['class_id', 'class_name']
          }],
          attributes: ['exam_id', 'title']
        }],
        attributes: ['submission_id', 'student_id']
      });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found or unauthorized'
        });
      }

      // Create or update grading record
      const [grading, created] = await Grading.findOrCreate({
        where: { submission_id: submissionId },
        defaults: {
          submission_id: submissionId,
          student_id: submission.student_id,
          grade: grade,
          feedback: feedback || '',
          graded_at: new Date()
        }
      });

      if (!created) {
        await grading.update({
          grade: grade,
          feedback: feedback || grading.feedback,
          graded_at: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Submission graded successfully',
        data: {
          gradingId: grading.grading_id,
          submissionId: grading.submission_id,
          studentId: grading.student_id,
          grade: grading.grade,
          feedback: grading.feedback,
          gradedAt: grading.graded_at
        }
      });

    } catch (error) {
      console.error('Grade submission API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to grade submission' 
      });
    }
  }

  // GET /api/teacher/:teacherId/files
  static async getFiles(req, res) {
    try {
      const { teacherId } = req.params;
      const { folderId, page = 1, limit = 20 } = req.query;
      
      if (!req.session.teacher || req.session.teacher.id !== parseInt(teacherId)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access' 
        });
      }

      // For now, return mock data since File model might not be fully implemented
      // In production, implement proper file management with the File model
      const mockFiles = [
        {
          id: 1,
          name: 'Course Syllabus.pdf',
          type: 'application/pdf',
          size: 1024567,
          updated_at: new Date(),
          teacher_id: teacherId
        },
        {
          id: 2,
          name: 'Lecture Notes.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 2048567,
          updated_at: new Date(),
          teacher_id: teacherId
        }
      ];

      const mockFolders = [
        {
          id: 1,
          name: 'Course Materials',
          file_count: 5,
          teacher_id: teacherId
        },
        {
          id: 2,
          name: 'Assignments',
          file_count: 3,
          teacher_id: teacherId
        }
      ];

      res.json({
        success: true,
        data: {
          files: mockFiles,
          folders: mockFolders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 1,
            totalFiles: mockFiles.length,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });

    } catch (error) {
      console.error('Teacher files API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load files' 
      });
    }
  }
}

module.exports = TeacherApiController;