const express = require('express')
const router = express.Router()
const welcomeController = require('../app/controllers/WelcomeController')


router.post('/login', welcomeController.login)
router.post('/signup', welcomeController.signup)


module.exports = router