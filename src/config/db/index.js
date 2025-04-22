const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '#BvOBV0332325650', // your MySQL password
  database: 'edu_db_dev'
});



module.exports = db;
