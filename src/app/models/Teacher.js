const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Teacher = sequelize.define('Teacher', {
    teacher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    teacher_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isTeacher: {
        type: DataTypes.BOOLEAN,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  }, {
    tableName: 'teacher',
    timestamps: false,
  });
  
  module.exports = Teacher;