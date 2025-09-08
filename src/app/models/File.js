const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const File = sequelize.define('File', {
  file_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Generated unique filename',
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original filename uploaded by user',
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'URL to access the file (Cloudinary or local storage)',
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'File size in bytes',
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'MIME type of the file',
  },
  file_type: {
    type: DataTypes.ENUM('document', 'image', 'video', 'audio', 'archive', 'other'),
    allowNull: false,
    defaultValue: 'document',
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of user who uploaded the file',
  },
  uploader_type: {
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'class_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Associated class if file is class-specific',
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'exam',
      key: 'exam_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Associated exam if file is exam-related',
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'submission',
      key: 'submission_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Associated submission if file is a student submission',
  },
  folder_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '/',
    comment: 'Virtual folder path for organization',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional file description',
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether file is publicly accessible',
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times file has been downloaded',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'files',
  timestamps: false,
});

module.exports = File;