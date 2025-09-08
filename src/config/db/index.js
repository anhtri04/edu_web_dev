

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration with environment variables and fallbacks
const sequelize = new Sequelize(
  process.env.DB_NAME || 'edu_db_dev',
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || '#BvOBV0332325650',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    },
    retry: {
      max: 3
    }
  }
);

module.exports = sequelize;