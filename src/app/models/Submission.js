const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

module.exports = (sequelize) => {
    const Submission = sequelize.define('Submission', {
      submission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      exam_id: {
        type: DataTypes.INTEGER
      },
      student_id: {
        type: DataTypes.INTEGER
      },
      uploading: {
        type: DataTypes.STRING(255)
      },
      comment: {
        type: DataTypes.TEXT
      },
      uploadDate: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'submission',
      timestamps: false
    });
  
    // Define associations in the associate method
    Submission.associate = (models) => {
      Submission.belongsTo(models.Exam, {
        foreignKey: 'exam_id',
        onDelete: 'CASCADE'
      });
      Submission.belongsTo(models.Student, {
        foreignKey: 'student_id',
        onDelete: 'CASCADE'
      });
      Submission.hasOne(models.Grading, {
        foreignKey: 'submission_id'
      });
    };
  
    return Submission;
  };