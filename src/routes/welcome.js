const express = require('express');
const router = express.Router();
const session = require('express-session')
const WelcomeController = require('../app/controllers/WelcomeController');

// Welcome route with authentication middleware
router.get('/welcome', WelcomeController.isAuthenticated, WelcomeController.showWelcome);

// Account route with authentication middleware
router.get('/account', WelcomeController.isAuthenticated, WelcomeController.showAccount);

// Home route
router.get('/', (req, res) => {
    res.render('home', { title: 'Home', student: req.session ? req.session.student : null });
  });
  
  

module.exports = router;