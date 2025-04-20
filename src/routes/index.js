const welcomeRouter = require('./welcome')


function route(app) {
    
  
    
    app.use('/welcome', welcomeRouter)
    // app.use('/news', newsRouter)
    // app.use('/courses', courseRouter)
    // app.use('/', siteRouter)

   

}

module.exports = route