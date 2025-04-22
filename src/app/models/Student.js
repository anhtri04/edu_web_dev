// src/app/models/Account.js
const connection = require('../../config/db');
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');
const Student = sequelize.define('Student', {
  student_id: DataTypes.INTEGER,
  Student_name: DataTypes.STRING,
  password: DataTypes.STRING,
  email: DataTypes.STRING
});

module.exports = Student