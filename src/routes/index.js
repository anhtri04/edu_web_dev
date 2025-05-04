

const welcomeRouter = require('./welcome')
const authRouter = require('./authentication')
const signUpRouter = require('./sign_up')
const courseRouter = require('./course')
const examRouter = require('./exam')

function route(app) {
    
  
    
    
    app.use('/course', courseRouter)
    app.use('/course/:slug/exam', examRouter)
    app.use('/signup', signUpRouter)
    app.use('/login', authRouter)
    app.use('/logout', authRouter)
    
    app.use('/', welcomeRouter)

}

module.exports = route