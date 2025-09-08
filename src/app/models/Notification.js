const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_type: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'success', 'error', 'announcement'),
    defaultValue: 'info',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of related entity (course, exam, etc.)',
  },
  related_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type of related entity (course, exam, assignment, etc.)',
  },
}, {
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;