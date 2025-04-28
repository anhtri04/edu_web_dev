const Student = require('./Student');
const Class = require('./Class');

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

module.exports = { Student, Class };