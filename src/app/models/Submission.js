const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Submission = sequelize.define('Submission', {
    submission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    uploading: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    uploadDate: {
        type: DataTypes.DATE,
        allowNull: false
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
  
module.exports = Submission;