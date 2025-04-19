const express = require('express')
const path = require('path')
const morgan = require('morgan')
const { engine } = require('express-handlebars')

const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded())

// Template engine
app.engine('handlebars', engine({ extname: '.handlebars' })) // Use engine() and set extension
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'resource','views'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})