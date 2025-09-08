const { File, Class, Exam, Submission } = require('../models');
const multer = require('multer');
const cloudinary = require('../../config/cloudinary');
const { Op } = require('sequelize');
const path = require('path');

class FileController {
  // Upload file to Cloudinary
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const {
        class_id,
        exam_id,
        submission_id,
        folder_path = '/',
        description = '',
        is_public = false
      } = req.body;

      const {
        uploaded_by,
        uploader_type
      } = req.user || { uploaded_by: req.body.uploaded_by, uploader_type: req.body.uploader_type };

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'edu_web_dev',
        resource_type: 'auto'
      });

      // Determine file type based on MIME type
      const getFileType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
        return 'document';
      };

      const file = await File.create({
        filename: result.public_id,
        original_name: req.file.originalname,
        file_url: result.secure_url,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        file_type: getFileType(req.file.mimetype),
        uploaded_by,
        uploader_type,
        class_id: class_id || null,
        exam_id: exam_id || null,
        submission_id: submission_id || null,
        folder_path,
        description,
        is_public
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: file
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error.message
      });
    }
  }

  // Get files with filtering options
  static async getFiles(req, res) {
    try {
      const {
        class_id,
        exam_id,
        submission_id,
        uploaded_by,
        uploader_type,
        file_type,
        folder_path,
        page = 1,
        limit = 20,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = {};

      // Apply filters
      if (class_id) whereClause.class_id = class_id;
      if (exam_id) whereClause.exam_id = exam_id;
      if (submission_id) whereClause.submission_id = submission_id;
      if (uploaded_by) whereClause.uploaded_by = uploaded_by;
      if (uploader_type) whereClause.uploader_type = uploader_type;
      if (file_type) whereClause.file_type = file_type;
      if (folder_path) whereClause.folder_path = folder_path;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { original_name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const files = await File.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name'],
            required: false
          },
          {
            model: Exam,
            attributes: ['exam_id', 'title'],
            required: false
          },
          {
            model: Submission,
            attributes: ['submission_id'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: files.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(files.count / limit),
          total_items: files.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch files',
        error: error.message
      });
    }
  }

  // Get file by ID
  static async getFileById(req, res) {
    try {
      const { id } = req.params;

      const file = await File.findByPk(id, {
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name'],
            required: false
          },
          {
            model: Exam,
            attributes: ['exam_id', 'title'],
            required: false
          },
          {
            model: Submission,
            attributes: ['submission_id'],
            required: false
          }
        ]
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      console.error('Error fetching file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch file',
        error: error.message
      });
    }
  }

  // Download file (increment download count)
  static async downloadFile(req, res) {
    try {
      const { id } = req.params;

      const file = await File.findByPk(id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Increment download count
      await file.increment('download_count');

      // Redirect to Cloudinary URL for download
      res.redirect(file.file_url);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }

  // Update file metadata
  static async updateFile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const file = await File.findByPk(id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      await file.update({
        ...updateData,
        updated_at: new Date()
      });

      res.json({
        success: true,
        message: 'File updated successfully',
        data: file
      });
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update file',
        error: error.message
      });
    }
  }

  // Delete file
  static async deleteFile(req, res) {
    try {
      const { id } = req.params;

      const file = await File.findByPk(id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(file.filename);
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
      }

      // Delete from database
      await file.destroy();

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error.message
      });
    }
  }

  // Get files by folder
  static async getFilesByFolder(req, res) {
    try {
      const { folder_path = '/' } = req.params;
      const { class_id, user_id, user_type } = req.query;

      let whereClause = { folder_path };

      if (class_id) {
        whereClause.class_id = class_id;
      }

      // Add user-specific filtering if needed
      if (user_id && user_type) {
        whereClause[Op.or] = [
          { uploaded_by: user_id, uploader_type: user_type },
          { is_public: true }
        ];
      }

      const files = await File.findAll({
        where: whereClause,
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name'],
            required: false
          }
        ],
        order: [['file_type', 'ASC'], ['original_name', 'ASC']]
      });

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      console.error('Error fetching files by folder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch files by folder',
        error: error.message
      });
    }
  }

  // Get file statistics
  static async getFileStats(req, res) {
    try {
      const { class_id, user_id, user_type } = req.query;

      let whereClause = {};
      if (class_id) whereClause.class_id = class_id;
      if (user_id && user_type) {
        whereClause.uploaded_by = user_id;
        whereClause.uploader_type = user_type;
      }

      const totalFiles = await File.count({ where: whereClause });
      
      const filesByType = await File.findAll({
        where: whereClause,
        attributes: [
          'file_type',
          [require('sequelize').fn('COUNT', require('sequelize').col('file_id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('file_size')), 'total_size']
        ],
        group: ['file_type']
      });

      const totalSize = await File.sum('file_size', { where: whereClause });

      res.json({
        success: true,
        data: {
          total_files: totalFiles,
          total_size: totalSize || 0,
          files_by_type: filesByType
        }
      });
    } catch (error) {
      console.error('Error fetching file statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch file statistics',
        error: error.message
      });
    }
  }

  // Bulk upload files
  static async bulkUpload(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const {
        class_id,
        exam_id,
        submission_id,
        folder_path = '/',
        description = '',
        is_public = false
      } = req.body;

      const {
        uploaded_by,
        uploader_type
      } = req.user || { uploaded_by: req.body.uploaded_by, uploader_type: req.body.uploader_type };

      const uploadPromises = req.files.map(async (file) => {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'edu_web_dev',
          resource_type: 'auto'
        });

        // Determine file type
        const getFileType = (mimeType) => {
          if (mimeType.startsWith('image/')) return 'image';
          if (mimeType.startsWith('video/')) return 'video';
          if (mimeType.startsWith('audio/')) return 'audio';
          if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
          return 'document';
        };

        return File.create({
          filename: result.public_id,
          original_name: file.originalname,
          file_url: result.secure_url,
          file_size: file.size,
          mime_type: file.mimetype,
          file_type: getFileType(file.mimetype),
          uploaded_by,
          uploader_type,
          class_id: class_id || null,
          exam_id: exam_id || null,
          submission_id: submission_id || null,
          folder_path,
          description,
          is_public
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: uploadedFiles
      });
    } catch (error) {
      console.error('Error bulk uploading files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error.message
      });
    }
  }
}

module.exports = FileController;