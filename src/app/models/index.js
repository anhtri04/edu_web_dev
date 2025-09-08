
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Import models in dependency order (parent tables first)
const Student = require('./Student');
const Teacher = require('./Teacher');
const Class = require('./Class');
const Exam = require('./Exam');
const Submission = require('./Submission');
const Grading = require('./Grading');
const Enrollment = require('./Enrollment');
const Notification = require('./Notification');
const CalendarEvent = require('./CalendarEvent');
const File = require('./File'); // Import last since it references exams and submissions// const Enrollment = sequelize.define('enrollment', {
//     student_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       references: {
//         model: 'students',
//         key: 'student_id'
//       },
//       onUpdate: 'RESTRICT',
//       onDelete: 'CASCADE',
//     },
//     class_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       references: {
//         model: 'classes',
//         key: 'class_id'
//       },
//       onUpdate: 'RESTRICT',
//       onDelete: 'CASCADE',
//     },
//   }, {
//     tableName: 'enrollment',
//     timestamps: false,
//   });
  
//   module.exports = Enrollment;


// Define the many-to-many relationship
Student.belongsToMany(Class, {
  through: 'enrollment',
  foreignKey: 'student_id',
  otherKey: 'class_id',
  onDelete: 'CASCADE',
});

Class.belongsToMany(Student, {
  through: 'enrollment',
  foreignKey: 'class_id', 
  otherKey: 'student_id',
  onDelete: 'CASCADE',
});

// Teacher ↔ Class (one-to-many)
Teacher.hasMany(Class, {
  foreignKey: 'teacher_id',
  onDelete: 'SET NULL',
});
Class.belongsTo(Teacher, {
  foreignKey: 'teacher_id',
});

// Class ↔ Exam (one-to-many)
Class.hasMany(Exam, {
  foreignKey: 'class_id',
  onDelete: 'CASCADE',
});
Exam.belongsTo(Class, {
  foreignKey: 'class_id',
});

// Teacher ↔ Exam (one-to-many)
Teacher.hasMany(Exam, {
  foreignKey: 'teacher_id',
  onDelete: 'CASCADE',
});
Exam.belongsTo(Teacher, {
  foreignKey: 'teacher_id',
});

// Exam ↔ Submission (one-to-many)
Exam.hasMany(Submission, {
  foreignKey: 'exam_id',
  onDelete: 'CASCADE',
});
Submission.belongsTo(Exam, {
  foreignKey: 'exam_id',
});

// Class ↔ CalendarEvent (one-to-many)
Class.hasMany(CalendarEvent, {
  foreignKey: 'class_id',
  onDelete: 'CASCADE',
});
CalendarEvent.belongsTo(Class, {
  foreignKey: 'class_id',
});

// Class ↔ File (one-to-many)
Class.hasMany(File, {
  foreignKey: 'class_id',
  onDelete: 'CASCADE',
});
File.belongsTo(Class, {
  foreignKey: 'class_id',
});

// Exam ↔ File (one-to-many)
Exam.hasMany(File, {
  foreignKey: 'exam_id',
  onDelete: 'CASCADE',
});
File.belongsTo(Exam, {
  foreignKey: 'exam_id',
});

// Enrollment ↔ Student (many-to-one)
Enrollment.belongsTo(Student, {
  foreignKey: 'student_id',
  onDelete: 'CASCADE',
});
Student.hasMany(Enrollment, {
  foreignKey: 'student_id',
  onDelete: 'CASCADE',
});

// Enrollment ↔ Class (many-to-one)
Enrollment.belongsTo(Class, {
  foreignKey: 'class_id',
  onDelete: 'CASCADE',
});
Class.hasMany(Enrollment, {
  foreignKey: 'class_id',
  onDelete: 'CASCADE',
});

// Submission ↔ Student (many-to-one)
Submission.belongsTo(Student, {
  foreignKey: 'student_id',
  onDelete: 'CASCADE',
});
Student.hasMany(Submission, {
  foreignKey: 'student_id',
  onDelete: 'CASCADE',
});

// Submission ↔ Grading (one-to-one)
Submission.hasOne(Grading, {
  foreignKey: 'submission_id',
  onDelete: 'CASCADE',
});
Grading.belongsTo(Submission, {
  foreignKey: 'submission_id',
  onDelete: 'CASCADE',
});

module.exports = { 
  Student, 
  Class, 
  Teacher, 
  Notification, 
  CalendarEvent, 
  File, 
  Exam, 
  Submission, 
  Grading, 
  Enrollment 
};