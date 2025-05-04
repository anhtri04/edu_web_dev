const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

module.exports = (sequelize) => {
    const Exam = sequelize.define('Exam', {
      exam_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      file: {
        type: DataTypes.STRING(255)
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(255)
      },
      deadline: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'exam',
      timestamps: false
    });
  
    // Define associations in the associate method
    Exam.associate = (models) => {
      Exam.belongsTo(models.Teacher, {
        foreignKey: 'teacher_id',
        onDelete: 'CASCADE'
      });
      Exam.hasMany(models.Submission, {
        foreignKey: 'exam_id'
      });
    };
  
    return Exam;
  };