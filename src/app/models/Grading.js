const Student = require('./Student');
const Class = require('./Class');
const Teacher = require('./Teacher');

module.exports = (sequelize) => {
    const Grading = sequelize.define('Grading', {
      submission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      grade: {
        type: DataTypes.INTEGER
      },
      comment: {
        type: DataTypes.TEXT
      }
    }, {
      tableName: 'grading',
      timestamps: false
    });
  
    // Define associations in the associate method
    Grading.associate = (models) => {
      Grading.belongsTo(models.Submission, {
        foreignKey: 'submission_id',
        onDelete: 'CASCADE'
      });
    };
  
    return Grading;
  };