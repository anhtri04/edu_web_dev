const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Class = sequelize.define('Class', {
  class_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  class_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  semester: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true, // Stores the Cloudinary URL (e.g., https://res.cloudinary.com/your-cloud-name/image/upload/...)
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false, 
    unique: true,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow NULL so that ON DELETE SET NULL can work
    references: {
      model: 'teacher',
      key: 'teacher_id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false, 
    unique: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  meeting_time: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Regular meeting time (e.g., "MWF 10:00-11:00")',
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  prerequisites: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

}, {
  tableName: 'classes',
  timestamps: false,
});




module.exports = Class;