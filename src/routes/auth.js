const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/AuthController');

// Authentication API endpoints
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/teacher-login', AuthController.teacherLogin);
router.get('/logout', AuthController.logout);

// Session verification endpoint
router.get('/verify', (req, res) => {
  try {
    if (req.session && (req.session.student || req.session.teacher)) {
      const user = req.session.student || req.session.teacher;
      const role = req.session.student ? 'student' : 'teacher';
      
      return res.json({
        success: true,
        isAuthenticated: true,
        user: {
          id: user.student_id || user.id,
          name: user.student_name || user.name,
          email: user.email,
          role: role
        }
      });
    }
    
    res.json({ 
      success: false, 
      isAuthenticated: false, 
      message: 'No active session' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      isAuthenticated: false, 
      message: 'Session verification failed' 
    });
  }
});

module.exports = router;