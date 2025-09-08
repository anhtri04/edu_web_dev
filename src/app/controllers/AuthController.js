const { Student } = require('../models');
const { Teacher } = require('../models');

const bcrypt = require('bcrypt');

class AuthController {

  

  static showSignup(req, res) {
    res.status(200).json({ message: 'Signup form endpoint', isSignup: true });
  }

  static async signup(req, res) {
    const { student_id, student_name, email, password, phone, date_of_birth, address, emergency_contact, emergency_phone } = req.body;
    
    try {
      // Check if email already exists
      const existingStudent = await Student.findOne({ where: { email } });
      if (existingStudent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists. Please use a different email address.' 
        });
      }

      // Check if student_id already exists
      const existingStudentId = await Student.findOne({ where: { student_id: parseInt(student_id) } });
      if (existingStudentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Student ID already exists. Please use a different student ID.' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newStudent = await Student.create({
        student_id: parseInt(student_id),
        student_name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        address: address || null,
        emergency_contact: emergency_contact || null,
        emergency_phone: emergency_phone || null,
        enrollment_date: new Date(),
        is_active: true
      });
      
      // Return JSON response
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        student: {
          id: newStudent.student_id,
          name: newStudent.student_name,
          email: newStudent.email
        }
      });
      
    } catch (error) {
      console.error('Signup error:', error);
      
      // Return JSON error
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      });
    }
  }

  static showLogin(req, res) {
    if (req.session && req.session.student) {
      return res.status(200).json({ message: 'Already logged in', redirectTo: '/welcome' });
    }
    res.status(200).json({ message: 'Login form endpoint', isSignup: false });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const student = await Student.findOne({ where: { email: email.toLowerCase() } });
      if (student && await bcrypt.compare(password, student.password)) {
        // Update last login
        await student.update({ last_login: new Date() });
        
        req.session.student = {
          student_id: student.student_id,
          student_name: student.student_name,
          email: student.email,
          profile_picture: student.profile_picture
        };
        
        // Return JSON response
        return res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: student.student_id,
            name: student.student_name,
            email: student.email,
            role: 'student',
            profile_picture: student.profile_picture
          },
          token: 'session-token' // For frontend compatibility
        });
      } else {
        const errorMessage = 'Invalid email or password';
        
        // Return JSON error
        return res.status(401).json({ 
          success: false, 
          message: errorMessage 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Login failed. Please try again.';
      
      // Return JSON error
      return res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  }

  static teacherShowLogin(req, res) {
    res.status(200).json({ message: 'Teacher login form endpoint', error: null });
  }

  static async teacherLogin(req, res) {
    const { email, password } = req.body;
    console.log('Teacher login attempt for email:', email);

    try {
        // Find teacher by email
        const teacher = await Teacher.findOne({ where: { email } });
        console.log('Teacher found:', teacher ? 'Yes' : 'No');

        if (!teacher) {
            console.log('Teacher not found in database');
            const errorMessage = 'Invalid email or password';
            
            return res.status(401).json({ 
              success: false, 
              message: errorMessage 
            });
        }

        console.log('Teacher isTeacher value:', teacher.isTeacher, 'Type:', typeof teacher.isTeacher);
        
        // Check if user is a teacher - handle both boolean and integer values
        if (teacher.isTeacher === false || teacher.isTeacher === 0 || teacher.isTeacher === null) {
            console.log('User is not authorized as teacher');
            const errorMessage = 'You are not authorized as a teacher';
            
            return res.status(403).json({ 
              success: false, 
              message: errorMessage 
            });
        }

        // Verify password
        console.log('Checking password...');
        const passwordMatch = await bcrypt.compare(password, teacher.password);
        console.log('Password match:', passwordMatch);
        
        if (!passwordMatch) {
            console.log('Password verification failed');
            const errorMessage = 'Invalid email or password';
            
            return res.status(401).json({ 
              success: false, 
              message: errorMessage 
            });
        }

        // Update last login
        await teacher.update({ last_login: new Date() });
        console.log('Teacher login successful');

        // Set session
        req.session.teacher = {
            id: teacher.teacher_id,
            name: teacher.teacher_name,
            email: teacher.email
        };

        // Return JSON response
        return res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: teacher.teacher_id,
            name: teacher.teacher_name,
            email: teacher.email,
            role: 'teacher'
          },
          token: 'session-token' // For frontend compatibility
        });

    } catch (error) {
        console.error('Teacher login error:', error);
        const errorMessage = 'An error occurred. Please try again.';
        
        return res.status(500).json({ 
          success: false, 
          message: errorMessage 
        });
    }
  }


  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      
      // Return JSON response for API calls
      if (req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
        return res.json({ 
          success: true, 
          message: 'Logout successful' 
        });
      }
      
      // Redirect for form submissions
      res.redirect('/login');
    });
  }
}

module.exports = AuthController;