
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Student = require('./Student');
const Class = require('./Class');
const Teacher = require('./Teacher');// const Enrollment = sequelize.define('enrollment', {
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

module.exports = { Student, Class, Teacher };