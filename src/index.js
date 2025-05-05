const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const session = require('express-session');

require('dotenv').config(); // Load .env variables


const app = express();
const port = 3000;

const route = require('./routes');
const sequelize = require('./config/db/index');
require('./app/models'); // Import models to ensure relationships are defined


// // Debug environment variables
// console.log('Environment Variables:', {
//   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
//   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
//   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '[REDACTED]' : undefined,
// });

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL database');
  })
  .catch(err => {
    console.error('Unable to connect to MySQL database:', err);
  });

// Sync database
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());

// Template engine
app.engine('handlebars', engine({ extname: '.handlebars' })); // Use engine() and set extension
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'resources','views'));



// Routes init
console.log('Routes loaded:', route); // Debug: Confirm routes are loaded
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})