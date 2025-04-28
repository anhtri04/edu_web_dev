const { Student } = require('../models');
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

  static logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
  }
}

module.exports = AuthController;