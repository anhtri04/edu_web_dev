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
        defaultValue: true,
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
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to profile picture',
    },
    hire_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    office_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'teacher',
    timestamps: false,
  });
  
  module.exports = Teacher;