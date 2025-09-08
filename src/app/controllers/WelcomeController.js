

class WelcomeController {
    
  
    // GET /welcome
    static showWelcome(req, res) {
      console.log('GET /welcome route hit');
      res.json({ message: 'Welcome endpoint', student: req.session.student });
    }

    static showAccount(req, res) {
      res.json({ message: 'Account endpoint', student: req.session.student }); 
    }

    static dashboard(req, res) {

      if (!req.session.teacher) {
        return res.status(401).json({ message: 'Unauthorized. Please login as teacher.' });
      }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
      res.json({ message: 'Teacher dashboard endpoint', teacher: req.session.teacher });
    }


  }
  
  module.exports = WelcomeController;