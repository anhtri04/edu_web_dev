const mysql = require('mysql')
const session = require('express-session')
const connection = require('../../config/db')


class WelcomeController{

    show(req, res) {
        res.render('Sign_in')
      }

    login(req, res) {
        
        let username = req.body.username
        let password = req.body.password
    
        if (username && password) {
            connection.query(
                'SELECT * FROM students WHERE student_name = ? AND password = ?',
                [username, password],   
                function (error, results, fields) {
                    if (error) throw error
    
                    if (results.length > 0) {
                        req.session.loggedin = true
                        req.session.username = username
                        res.redirect('/home')
                    } else {
                        res.send('Incorrect Username and/or Password!')
                    }
                    res.end()
                }
            )
        } else {
            res.send('Please enter Username and Password!')
            res.end()
        }
    }
    
    
    
}

module.exports = new WelcomeController