const { Student, Class, Enrollment, Exam, Submission, Grading, Notification, CalendarEvent, File } = require('../models');
const { Op } = require('sequelize');

class StudentController {
  // Get student dashboard data
  static async getDashboard(req, res) {
    try {
      const { student_id } = req.params;

      // Get student info
      const student = await Student.findByPk(student_id, {
        attributes: ['student_id', 'student_name', 'email', 'profile_picture', 'last_login']
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get enrolled classes with teacher info
      const enrolledClasses = await Class.findAll({
        include: [
          {
            model: Student,
            where: { student_id },
            through: { attributes: [] },
            attributes: []
          },
          {
            model: require('../models').Teacher,
            attributes: ['teacher_id', 'teacher_name', 'email']
          }
        ],
        attributes: ['class_id', 'class_name', 'description', 'semester', 'imageUrl']
      });

      // Get upcoming exams (next 30 days)
      const upcomingExams = await Exam.findAll({
        include: [
          {
            model: Class,
            include: [
              {
                model: Student,
                where: { student_id },
                through: { attributes: [] },
                attributes: []
              }
            ]
          }
        ],
        where: {
          deadline: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          }
        },
        order: [['deadline', 'ASC']],
        limit: 5
      });

      // Get recent grades
      const recentGrades = await Grading.findAll({
        include: [
          {
            model: Submission,
            include: [
              {
                model: require('../models').Student,
                where: { student_id },
                attributes: []
              },
              {
                model: Exam,
                include: [
                  {
                    model: Class,
                    attributes: ['class_name']
                  }
                ]
              }
            ]
          }
        ],
        order: [['grade', 'DESC']],
        limit: 5
      });

      // Get unread notifications count
      const unreadNotifications = await Notification.count({
        where: {
          user_id: student_id,
          user_type: 'student',
          is_read: false
        }
      });

      // Get upcoming calendar events
      const upcomingEvents = await CalendarEvent.findAll({
        where: {
          start_date: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          }
        },
        include: [
          {
            model: Class,
            include: [
              {
                model: Student,
                where: { student_id },
                through: { attributes: [] },
                attributes: []
              }
            ]
          }
        ],
        order: [['start_date', 'ASC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          student,
          enrolled_classes: enrolledClasses,
          upcoming_exams: upcomingExams,
          recent_grades: recentGrades,
          unread_notifications: unreadNotifications,
          upcoming_events: upcomingEvents,
          stats: {
            total_classes: enrolledClasses.length,
            pending_exams: upcomingExams.length,
            unread_notifications: unreadNotifications
          }
        }
      });
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // Get student's enrolled courses
  static async getEnrolledCourses(req, res) {
    try {
      const { student_id } = req.params;
      const { semester, active_only = true } = req.query;

      let whereClause = {};
      if (semester) whereClause.semester = semester;
      if (active_only === 'true') whereClause.is_active = true;

      const courses = await Class.findAll({
        include: [
          {
            model: Student,
            where: { student_id },
            through: { attributes: [] },
            attributes: []
          },
          {
            model: require('../models').Teacher,
            attributes: ['teacher_id', 'teacher_name', 'email', 'department']
          }
        ],
        where: whereClause,
        attributes: ['class_id', 'class_name', 'description', 'semester', 'imageUrl', 'meeting_time', 'location', 'credits']
      });

      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrolled courses',
        error: error.message
      });
    }
  }

  // Get available courses for enrollment
  static async getAvailableCourses(req, res) {
    try {
      const { student_id } = req.params;
      const { semester, department } = req.query;

      let whereClause = { is_active: true };
      if (semester) whereClause.semester = semester;

      // Get courses not already enrolled in
      const enrolledClassIds = await Enrollment.findAll({
        where: { student_id },
        attributes: ['class_id']
      }).then(enrollments => enrollments.map(e => e.class_id));

      if (enrolledClassIds.length > 0) {
        whereClause.class_id = { [Op.notIn]: enrolledClassIds };
      }

      const availableCourses = await Class.findAll({
        include: [
          {
            model: require('../models').Teacher,
            attributes: ['teacher_id', 'teacher_name', 'email', 'department'],
            where: department ? { department } : {}
          }
        ],
        where: whereClause,
        attributes: ['class_id', 'class_name', 'description', 'semester', 'imageUrl', 'meeting_time', 'location', 'credits', 'max_students']
      });

      res.json({
        success: true,
        data: availableCourses
      });
    } catch (error) {
      console.error('Error fetching available courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available courses',
        error: error.message
      });
    }
  }

  // Enroll in a course
  static async enrollInCourse(req, res) {
    try {
      const { student_id } = req.params;
      const { class_id } = req.body;

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        where: { student_id, class_id }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Check class capacity
      const classInfo = await Class.findByPk(class_id);
      if (!classInfo) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const currentEnrollments = await Enrollment.count({
        where: { class_id }
      });

      if (currentEnrollments >= classInfo.max_students) {
        return res.status(400).json({
          success: false,
          message: 'Course is full'
        });
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        student_id,
        class_id
      });

      // Create notification
      await Notification.create({
        user_id: student_id,
        user_type: 'student',
        title: 'Course Enrollment Successful',
        message: `You have successfully enrolled in ${classInfo.class_name}`,
        type: 'success',
        related_id: class_id,
        related_type: 'course'
      });

      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: enrollment
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
        error: error.message
      });
    }
  }

  // Get student's grades
  static async getGrades(req, res) {
    try {
      const { student_id } = req.params;
      const { class_id, semester } = req.query;

      let includeWhere = {};
      if (class_id) {
        includeWhere = {
          include: [
            {
              model: Class,
              where: { class_id },
              attributes: ['class_name', 'semester']
            }
          ]
        };
      } else if (semester) {
        includeWhere = {
          include: [
            {
              model: Class,
              where: { semester },
              attributes: ['class_name', 'semester']
            }
          ]
        };
      }

      const grades = await Grading.findAll({
        include: [
          {
            model: Submission,
            include: [
              {
                model: require('../models').Student,
                where: { student_id },
                attributes: []
              },
              {
                model: Exam,
                include: [
                  {
                    model: Class,
                    ...(includeWhere.include && includeWhere.include[0].where ? { where: includeWhere.include[0].where } : {}),
                    attributes: ['class_id', 'class_name', 'semester']
                  }
                ]
              }
            ]
          }
        ],
        order: [['grade', 'DESC']]
      });

      // Calculate GPA and statistics
      const gradeStats = {
        total_assignments: grades.length,
        average_grade: grades.length > 0 ? grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length : 0,
        highest_grade: grades.length > 0 ? Math.max(...grades.map(g => parseFloat(g.grade))) : 0,
        lowest_grade: grades.length > 0 ? Math.min(...grades.map(g => parseFloat(g.grade))) : 0
      };

      res.json({
        success: true,
        data: {
          grades,
          statistics: gradeStats
        }
      });
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch grades',
        error: error.message
      });
    }
  }

  // Get student's exam submissions
  static async getSubmissions(req, res) {
    try {
      const { student_id } = req.params;
      const { class_id, status } = req.query;

      let whereClause = { student_id };
      if (status) whereClause.status = status;

      const submissions = await Submission.findAll({
        where: whereClause,
        include: [
          {
            model: Exam,
            include: [
              {
                model: Class,
                ...(class_id ? { where: { class_id } } : {}),
                attributes: ['class_id', 'class_name', 'semester']
              }
            ]
          },
          {
            model: Grading,
            required: false
          },
          {
            model: File,
            required: false,
            attributes: ['file_id', 'original_name', 'file_url', 'file_type']
          }
        ],
        order: [['submitted_at', 'DESC']]
      });

      res.json({
        success: true,
        data: submissions
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions',
        error: error.message
      });
    }
  }

  // Update student profile
  static async updateProfile(req, res) {
    try {
      const { student_id } = req.params;
      const updateData = req.body;

      const student = await Student.findByPk(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      await student.update(updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: student
      });
    } catch (error) {
      console.error('Error updating student profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Get student's calendar events
  static async getCalendarEvents(req, res) {
    try {
      const { student_id } = req.params;
      const { start_date, end_date } = req.query;

      let whereClause = {};
      if (start_date && end_date) {
        whereClause[Op.or] = [
          {
            start_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            end_date: {
              [Op.between]: [start_date, end_date]
            }
          }
        ];
      }

      const events = await CalendarEvent.findAll({
        where: whereClause,
        include: [
          {
            model: Class,
            include: [
              {
                model: Student,
                where: { student_id },
                through: { attributes: [] },
                attributes: []
              }
            ]
          }
        ],
        order: [['start_date', 'ASC']]
      });

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error.message
      });
    }
  }

  // Get student's files
  static async getFiles(req, res) {
    try {
      const { student_id } = req.params;
      const { class_id, file_type, page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = {
        uploaded_by: student_id,
        uploader_type: 'student'
      };

      if (class_id) whereClause.class_id = class_id;
      if (file_type) whereClause.file_type = file_type;

      const files = await File.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: files.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(files.count / limit),
          total_items: files.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching student files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch files',
        error: error.message
      });
    }
  }
}

module.exports = StudentController;