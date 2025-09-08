const { Student, Teacher, Class, Enrollment, Exam, Submission, Grading, Notification, CalendarEvent, File } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

class AdminController {
  // Get admin dashboard statistics
  static async getDashboard(req, res) {
    try {
      // Get basic counts
      const totalStudents = await Student.count({ where: { is_active: true } });
      const totalTeachers = await Teacher.count({ where: { is_active: true } });
      const totalClasses = await Class.count({ where: { is_active: true } });
      const totalEnrollments = await Enrollment.count();

      // Get recent activity
      const recentEnrollments = await Enrollment.findAll({
        include: [
          {
            model: Student,
            attributes: ['student_name', 'email']
          },
          {
            model: Class,
            attributes: ['class_name', 'semester']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      // Get monthly statistics
      const monthlyStats = await Promise.all([
        Student.count({
          where: {
            enrollment_date: {
              [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        }),
        Enrollment.count({
          where: {
            created_at: {
              [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        }),
        Submission.count({
          where: {
            submitted_at: {
              [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        })
      ]);

      // Get system alerts (ungraded submissions, overdue exams, etc.)
      const ungradedSubmissions = await Submission.count({
        where: {
          '$Grading.grading_id$': null
        },
        include: [
          {
            model: Grading,
            required: false
          }
        ]
      });

      const overdueExams = await Exam.count({
        where: {
          due_date: {
            [Op.lt]: new Date()
          },
          status: 'active'
        }
      });

      res.json({
        success: true,
        data: {
          overview: {
            total_students: totalStudents,
            total_teachers: totalTeachers,
            total_classes: totalClasses,
            total_enrollments: totalEnrollments
          },
          monthly_stats: {
            new_students: monthlyStats[0],
            new_enrollments: monthlyStats[1],
            submissions: monthlyStats[2]
          },
          recent_activity: recentEnrollments,
          alerts: {
            ungraded_submissions: ungradedSubmissions,
            overdue_exams: overdueExams
          }
        }
      });
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // Get all students with pagination and filtering
  static async getAllStudents(req, res) {
    try {
      const { page = 1, limit = 20, search, is_active, semester } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (is_active !== undefined) whereClause.is_active = is_active === 'true';
      
      if (search) {
        whereClause[Op.or] = [
          { student_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const students = await Student.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Class,
            through: { attributes: [] },
            attributes: ['class_id', 'class_name', 'semester'],
            where: semester ? { semester } : {},
            required: semester ? true : false
          }
        ],
        order: [['student_name', 'ASC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      res.json({
        success: true,
        data: students.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(students.count / limit),
          total_items: students.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students',
        error: error.message
      });
    }
  }

  // Get all teachers with pagination and filtering
  static async getAllTeachers(req, res) {
    try {
      const { page = 1, limit = 20, search, is_active, department } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (is_active !== undefined) whereClause.is_active = is_active === 'true';
      if (department) whereClause.department = department;
      
      if (search) {
        whereClause[Op.or] = [
          { teacher_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const teachers = await Teacher.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name', 'semester'],
            required: false
          }
        ],
        order: [['teacher_name', 'ASC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: teachers.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(teachers.count / limit),
          total_items: teachers.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching teachers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teachers',
        error: error.message
      });
    }
  }

  // Create new student
  static async createStudent(req, res) {
    try {
      const {
        student_name,
        email,
        password,
        phone,
        date_of_birth,
        address,
        emergency_contact,
        emergency_phone
      } = req.body;

      // Check if email already exists
      const existingStudent = await Student.findOne({ where: { email } });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate student ID
      const lastStudent = await Student.findOne({
        order: [['student_id', 'DESC']]
      });
      const newStudentId = lastStudent ? lastStudent.student_id + 1 : 1;

      const student = await Student.create({
        student_id: newStudentId,
        student_name,
        email,
        password: hashedPassword,
        phone,
        date_of_birth,
        address,
        emergency_contact,
        emergency_phone,
        enrollment_date: new Date()
      });

      // Create welcome notification
      await Notification.create({
        user_id: newStudentId,
        user_type: 'student',
        title: 'Welcome to the School System',
        message: `Welcome ${student_name}! Your account has been created successfully.`,
        type: 'success'
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: {
          student_id: student.student_id,
          student_name: student.student_name,
          email: student.email
        }
      });
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create student',
        error: error.message
      });
    }
  }

  // Create new teacher
  static async createTeacher(req, res) {
    try {
      const {
        teacher_name,
        email,
        password,
        phone,
        department,
        qualification,
        hire_date,
        office_location,
        bio
      } = req.body;

      // Check if email already exists
      const existingTeacher = await Teacher.findOne({ where: { email } });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate teacher ID
      const lastTeacher = await Teacher.findOne({
        order: [['teacher_id', 'DESC']]
      });
      const newTeacherId = lastTeacher ? lastTeacher.teacher_id + 1 : 1;

      const teacher = await Teacher.create({
        teacher_id: newTeacherId,
        teacher_name,
        email,
        password: hashedPassword,
        phone,
        department,
        qualification,
        hire_date: hire_date || new Date(),
        office_location,
        bio
      });

      // Create welcome notification
      await Notification.create({
        user_id: newTeacherId,
        user_type: 'teacher',
        title: 'Welcome to the School System',
        message: `Welcome ${teacher_name}! Your teacher account has been created successfully.`,
        type: 'success'
      });

      res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: {
          teacher_id: teacher.teacher_id,
          teacher_name: teacher.teacher_name,
          email: teacher.email
        }
      });
    } catch (error) {
      console.error('Error creating teacher:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create teacher',
        error: error.message
      });
    }
  }

  // Update user status (activate/deactivate)
  static async updateUserStatus(req, res) {
    try {
      const { user_type, user_id } = req.params;
      const { is_active } = req.body;

      let user;
      if (user_type === 'student') {
        user = await Student.findByPk(user_id);
      } else if (user_type === 'teacher') {
        user = await Teacher.findByPk(user_id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ is_active });

      res.json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message
      });
    }
  }

  // Get system statistics for reports
  static async getSystemStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const dateFilter = {};
      if (start_date && end_date) {
        dateFilter.created_at = {
          [Op.between]: [start_date, end_date]
        };
      }

      // User statistics
      const userStats = await Promise.all([
        Student.count({ where: { is_active: true } }),
        Teacher.count({ where: { is_active: true } }),
        Student.count({ where: { ...dateFilter, is_active: true } }),
        Teacher.count({ where: { ...dateFilter, is_active: true } })
      ]);

      // Course statistics
      const courseStats = await Promise.all([
        Class.count({ where: { is_active: true } }),
        Enrollment.count(),
        Exam.count(),
        Submission.count({ where: dateFilter })
      ]);

      // Performance statistics
      const avgGrade = await Grading.findOne({
        attributes: [[require('sequelize').fn('AVG', require('sequelize').col('grade')), 'average']],
        where: dateFilter
      });

      // File usage statistics
      const fileStats = await File.findOne({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('file_id')), 'total_files'],
          [require('sequelize').fn('SUM', require('sequelize').col('file_size')), 'total_size']
        ],
        where: dateFilter
      });

      res.json({
        success: true,
        data: {
          users: {
            active_students: userStats[0],
            active_teachers: userStats[1],
            new_students: userStats[2],
            new_teachers: userStats[3]
          },
          courses: {
            total_classes: courseStats[0],
            total_enrollments: courseStats[1],
            total_exams: courseStats[2],
            total_submissions: courseStats[3]
          },
          performance: {
            average_grade: avgGrade ? parseFloat(avgGrade.dataValues.average) || 0 : 0
          },
          files: {
            total_files: fileStats ? parseInt(fileStats.dataValues.total_files) || 0 : 0,
            total_size_mb: fileStats ? Math.round((fileStats.dataValues.total_size || 0) / (1024 * 1024)) : 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system statistics',
        error: error.message
      });
    }
  }

  // Bulk notification sending
  static async sendBulkNotification(req, res) {
    try {
      const { 
        recipient_type, // 'all', 'students', 'teachers', 'class'
        class_id, // if recipient_type is 'class'
        title,
        message,
        type = 'announcement'
      } = req.body;

      let recipients = [];

      switch (recipient_type) {
        case 'all':
          const students = await Student.findAll({ 
            where: { is_active: true },
            attributes: ['student_id']
          });
          const teachers = await Teacher.findAll({ 
            where: { is_active: true },
            attributes: ['teacher_id']
          });
          
          recipients = [
            ...students.map(s => ({ user_id: s.student_id, user_type: 'student' })),
            ...teachers.map(t => ({ user_id: t.teacher_id, user_type: 'teacher' }))
          ];
          break;

        case 'students':
          const allStudents = await Student.findAll({ 
            where: { is_active: true },
            attributes: ['student_id']
          });
          recipients = allStudents.map(s => ({ user_id: s.student_id, user_type: 'student' }));
          break;

        case 'teachers':
          const allTeachers = await Teacher.findAll({ 
            where: { is_active: true },
            attributes: ['teacher_id']
          });
          recipients = allTeachers.map(t => ({ user_id: t.teacher_id, user_type: 'teacher' }));
          break;

        case 'class':
          if (!class_id) {
            return res.status(400).json({
              success: false,
              message: 'Class ID is required for class notifications'
            });
          }

          const classStudents = await Student.findAll({
            include: [
              {
                model: Class,
                where: { class_id },
                through: { attributes: [] },
                attributes: []
              }
            ],
            attributes: ['student_id']
          });
          recipients = classStudents.map(s => ({ user_id: s.student_id, user_type: 'student' }));
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid recipient type'
          });
      }

      if (recipients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No recipients found'
        });
      }

      // Create notifications in bulk
      const notifications = recipients.map(recipient => ({
        user_id: recipient.user_id,
        user_type: recipient.user_type,
        title,
        message,
        type,
        related_id: class_id || null,
        related_type: class_id ? 'class' : null
      }));

      await Notification.bulkCreate(notifications);

      res.json({
        success: true,
        message: `Notification sent to ${recipients.length} recipients`
      });
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message
      });
    }
  }

  // Delete user account
  static async deleteUser(req, res) {
    try {
      const { user_type, user_id } = req.params;

      let user;
      if (user_type === 'student') {
        user = await Student.findByPk(user_id);
      } else if (user_type === 'teacher') {
        user = await Teacher.findByPk(user_id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete by setting is_active to false instead of actual deletion
      await user.update({ is_active: false });

      res.json({
        success: true,
        message: 'User account deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }
}

module.exports = AdminController;