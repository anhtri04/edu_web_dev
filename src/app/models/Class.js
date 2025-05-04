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
    allowNull: true, 
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'classes',
  timestamps: false,
});




module.exports = Class;