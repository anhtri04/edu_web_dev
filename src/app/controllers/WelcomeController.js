class WelcomeController {
    // Middleware to check if student is logged in
    static isAuthenticated(req, res, next) {
      if (req.session.student) {
        return next();
      }
      res.redirect('/login');
    }
  
    // GET /welcome
    static showWelcome(req, res) {
      console.log('GET /welcome route hit');
      res.render('home', { title: 'Welcome', student: req.session.student });
    }

    static showAccount(req, res) {
      res.render('account/account', { title: 'Account', student: req.session.student }); 
    }
  }
  
  module.exports = WelcomeController;