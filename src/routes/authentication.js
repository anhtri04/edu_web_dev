const express = require('express');
const router = express.Router();

const AuthController = require('../app/controllers/AuthController');






router.get('/', (req, res) => {
  console.log('GET /login route hit');
  AuthController.showLogin(req, res);
});

router.post('/', AuthController.login);



module.exports = router;