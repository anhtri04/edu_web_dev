const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Enrollment = sequelize.define('Enrollment', {
    student_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    class_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'enrollment',
    timestamps: false
});

module.exports =  Enrollment ;