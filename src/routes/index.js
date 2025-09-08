

const welcomeRouter = require('./welcome')
const authRouter = require('./authentication')
const signUpRouter = require('./sign_up')
const courseRouter = require('./course')
const examRouter = require('./exam')
const logoutRouter = require('./out')
const teacherRouter = require('./teacher')
const apiRouter = require('./api')
const healthRouter = require('./health')

function route(app) {
    
  
    
    app.use('/teacher', teacherRouter)    
    // app.use('/student', studentRouter)
    app.use('/course', courseRouter)
    app.use('/course/:slug/exam', examRouter)
    app.use('/signup', signUpRouter)
    app.use('/login', authRouter)
    app.use('/api', apiRouter)
    app.use('/api', healthRouter)
    app.use('/logout', logoutRouter)
    app.use('/', welcomeRouter)

}

module.exports = route