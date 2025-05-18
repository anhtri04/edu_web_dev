

class WelcomeController {
    
  
    // GET /welcome
    static showWelcome(req, res) {
      console.log('GET /welcome route hit');
      res.render('home', { title: 'Welcome', student: req.session.student });
    }

    static showAccount(req, res) {
      res.render('account/account', { title: 'Account', student: req.session.student }); 
    }

    static dashboard(req, res) {

      if (!req.session.teacher) {
        return res.redirect('/login/teacher');
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
      res.render('teacherView/dashboard', {teacher: req.session.teacher})
    }


  }
  
  module.exports = WelcomeController;