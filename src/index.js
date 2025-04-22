const express = require('express')
const path = require('path')
const morgan = require('morgan')
const { engine } = require('express-handlebars')
const mysql = require('mysql')
const session = require('express-session');


const app = express()
const port = 3000

const route = require('./routes')
const connection = require('./config/db/index')

//MySQL connect
connection.connect((err) => {
  if (!err){
    console.log("Connection Successful!");
  } else{
    console.log("Error while connecting to the database:" + err);
  }
});


app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded())

// Template engine
app.engine('handlebars', engine({ extname: '.handlebars' })) // Use engine() and set extension
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'resources','views'))



// Routes init
route(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})