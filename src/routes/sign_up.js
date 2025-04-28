const express = require('express');
const router = express.Router();

const AuthController = require('../app/controllers/AuthController');

// Authentication routes
router.get('/', AuthController.showSignup);
router.post('/', AuthController.signup);

module.exports = router;