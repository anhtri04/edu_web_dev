

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('edu_db_dev', 'root', '#BvOBV0332325650', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Set to true if you want to see SQL queries
});

module.exports = sequelize;