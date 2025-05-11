const { Student } = require('../models');
const { Teacher } = require('../models');

const bcrypt = require('bcrypt');

class AuthController {

  

  static showSignup(req, res) {
    res.render('sign_in', { title: 'Sign Up', isSignup: true });
  }

  static async signup(req, res) {
    const { student_id, student_name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Student.create({
        student_id: parseInt(student_id),
        student_name,
        email,
        password: hashedPassword,
      });
      res.redirect('/login');
    } catch (error) {
      res.render('sign_in', { title: 'Sign Up', isSignup: true, error: error.message });
    }
  }

  static showLogin(req, res) {
    
    if (req.session && req.session.student) {
      return res.redirect('/welcome'); // Redirect logged-in users to /welcome
    }
    res.render('sign_in', { title: 'Login', isSignup: false });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const student = await Student.findOne({ where: { email } });
      if (student && await bcrypt.compare(password, student.password)) {
        req.session.student = student;
        res.redirect('/welcome');
      } else {
        res.render('sign_in', { title: 'Login', isSignup: false, error: 'Invalid credentials' });
      }
    } catch (error) {
      res.render('sign_in', { title: 'Login', isSignup: false, error: error.message });
    }
  }

  static teacherShowLogin(req, res) {
    res.render('auth/teacherLogin', { error: null });
  }

  static async teacherLogin(req, res) {
    const { email, password } = req.body;

    try {
        // Find teacher by email
        const teacher = await Teacher.findOne({ where: { email } });

        if (!teacher) {
            return res.render('auth/teacherLogIn', {  
                error: 'Invalid email or password'
            });
        }

        // Check if user is a teacher
        if (teacher.isTeacher === null || teacher.isTeacher === 0) {
            return res.render('auth/teacherLogIn', {
                error: 'You are not authorized as a teacher'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, teacher.password);
        if (!passwordMatch) {
            return res.render('auth/teacherLogIn', {
                error: 'Invalid email or password'
            });
        }

        // Set session or token
        req.session.teacher = {
            id: teacher.teacher_id,
            name: teacher.teacher_name,
            email: teacher.email
        };

        // Redirect to teacher dashboard
        res.redirect('/teacher/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/teacherLogIn', {
            error: 'An error occurred. Please try again.'
        });
    }
  }


  static logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
  }
}

module.exports = AuthController;