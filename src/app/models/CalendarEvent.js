const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CalendarEvent = sequelize.define('CalendarEvent', {
  event_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  event_type: {
    type: DataTypes.ENUM('exam', 'class', 'deadline', 'holiday', 'announcement', 'meeting'),
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'class_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of user who created the event',
  },
  creator_type: {
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    allowNull: false,
  },
  is_all_day: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#3498db',
    comment: 'Hex color code for calendar display',
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurrence_pattern: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Recurrence pattern (daily, weekly, monthly)',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'calendar_events',
  timestamps: false,
});

module.exports = CalendarEvent;