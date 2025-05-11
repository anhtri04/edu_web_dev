
class authConfig {
    // Middleware to check if student/teacher is logged in
    static isAuthenticated(req, res, next) {
        if (req.session.student || req.session.teacher) {
          return next();
        }
        res.redirect('/login');
      }

      static studentAuthenticated(req, res, next) {
        if (req.session.student) {
          return next();
        }
        res.redirect('/login');
      }

      static teachAuthenticated(req, res, next) {
        if (req.session.teacher) {
          return next();
        }
        res.redirect('/login');
      }
}

module.exports = authConfig;