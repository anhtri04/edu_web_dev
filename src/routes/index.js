

const welcomeRouter = require('./welcome')


function route(app) {
    
  
    
    app.use('/', welcomeRouter)
    app.use('/login', welcomeRouter)
    // app.use('/news', newsRouter)
    // app.use('/courses', courseRouter)
    // app.use('/', siteRouter)

   

}

module.exports = route