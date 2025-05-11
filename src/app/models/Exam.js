const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Define the Exam model
const Exam = sequelize.define('Exam', {
    exam_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    material: { // Changed from 'file' to match ExamController
        type: DataTypes.STRING(255),
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
    },
    deadline: {
        type: DataTypes.DATE,
    },
    class_id: { // Added to match ExamController
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'exam',
    timestamps: false,
});

// Define associations (will need manual setup for now)
Exam.associate = (models) => {
    Exam.belongsTo(models.Teacher, {
        foreignKey: 'teacher_id',
        onDelete: 'CASCADE',
    });
    Exam.hasMany(models.Submission, {
        foreignKey: 'exam_id',
    });
    Exam.belongsTo(models.Class, {
        foreignKey: 'class_id',
        onDelete: 'CASCADE',
    });
};

// Export the model
module.exports = Exam;