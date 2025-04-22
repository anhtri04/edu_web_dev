const express = require('express')
const router = express.Router()
const welcomeController = require('../app/controllers/WelcomeController')


router.post('/login', welcomeController.login)
// router.post('/signup', welcomeController.signup)
router.get('/welcome', welcomeController.show)
// router.get('/', welcomeController.show)

module.exports = router