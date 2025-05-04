const Student = require('./Student');
const Class = require('./Class');
const Teacher = require('./Teacher');


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