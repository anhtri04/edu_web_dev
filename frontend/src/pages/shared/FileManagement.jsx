import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search,
  Filter,
  Folder,
  FolderOpen,
  File,
  Image,
  FileIcon,
  Plus,
  Eye,
  Share,
  MoreVertical,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  HardDrive
} from 'lucide-react';

const FileManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [view, setView] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('name'); // name, date, size, type
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [filterType, setFilterType] = useState('all'); // all, image, document, video, audio
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);

  // Fetch files
  const { data: filesData, isLoading, error } = useQuery({
    queryKey: ['files', user?.id, currentFolder, filterType, sortBy, sortOrder],
    queryFn: () => fileService.getFiles(user?.id, {
      folder: currentFolder,
      type: filterType !== 'all' ? filterType : undefined,
      sort_by: sortBy,
      sort_order: sortOrder
    }),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: (formData) => fileService.uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['files']);
      setShowUploadModal(false);
      setUploadFiles([]);
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries(['files']);
      setSelectedFiles(prev => prev.filter(id => id !== arguments[0]));
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading files. Please try again later.
      </div>
    );
  }

  const { files = [], folders = [], total_size = 0, total_count = 0 } = filesData || {};

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (mimeType, fileType) => {
    if (mimeType?.startsWith('image/')) return Image;
    if (mimeType?.startsWith('video/')) return FileIcon;
    if (mimeType?.startsWith('audio/')) return FileIcon;
    if (mimeType?.includes('pdf')) return FileText;
    if (mimeType?.includes('document') || mimeType?.includes('doc')) return FileText;
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadFiles(files);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (uploadData) => {
    for (const file of uploadFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploader_id', user.id);
      formData.append('uploader_type', user.user_type);
      formData.append('folder_path', currentFolder);
      formData.append('description', uploadData.description || '');
      formData.append('is_public', uploadData.is_public || false);
      
      if (uploadData.class_id) formData.append('class_id', uploadData.class_id);
      if (uploadData.exam_id) formData.append('exam_id', uploadData.exam_id);

      await uploadFileMutation.mutateAsync(formData);
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const response = await fileService.downloadFile(file.file_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteFileMutation.mutate(fileId);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
      for (const fileId of selectedFiles) {
        await handleFileDelete(fileId);
      }
      setSelectedFiles([]);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.file_id));
    }
  };

  const UploadModal = () => {
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [classId, setClassId] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Files to upload ({uploadFiles.length})
              </label>
              <div className="space-y-1">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center">
                    <File className="w-4 h-4 mr-2" />
                    {file.name} ({formatFileSize(file.size)})
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter file description..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Make files public
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadFiles([]);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUploadSubmit({ description, is_public: isPublic, class_id: classId })}
              disabled={uploadFileMutation.isLoading}
              className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadFileMutation.isLoading ? <LoadingSpinner size="small" /> : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FileCard = ({ file }) => {
    const FileIconComponent = getFileIcon(file.mime_type, file.file_type);
    const isSelected = selectedFiles.includes(file.file_id);

    return (
      <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}>
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleFileSelection(file.file_id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <FileIconComponent className="w-8 h-8 text-gray-500" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {file.original_name}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.file_size)} • {file.mime_type}
                </p>
              </div>
            </div>

            {file.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {file.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>{file.uploader_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{new Date(file.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileDownload(file);
                }}
                className="flex-1 inline-flex items-center justify-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </button>
              {(file.uploader_id === user.id || user.user_type === 'admin') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileDelete(file.file_id);
                  }}
                  className="px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FileRow = ({ file }) => {
    const FileIconComponent = getFileIcon(file.mime_type, file.file_type);
    const isSelected = selectedFiles.includes(file.file_id);

    return (
      <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleFileSelection(file.file_id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <FileIconComponent className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900">{file.original_name}</div>
              <div className="text-sm text-gray-500">{file.mime_type}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatFileSize(file.file_size)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {file.uploader_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(file.created_at).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFileDownload(file)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Download className="w-4 h-4" />
            </button>
            {(file.uploader_id === user.id || user.user_type === 'admin') && (
              <button
                onClick={() => handleFileDelete(file.file_id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              File Management
            </h1>
            <p className="text-gray-600">Upload, organize, and manage your files</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Files</dt>
                  <dd className="text-lg font-medium text-gray-900">{total_count}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HardDrive className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Size</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatFileSize(total_size)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Images</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {files.filter(f => f.mime_type?.startsWith('image/')).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Documents</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {files.filter(f => f.mime_type?.includes('document') || f.mime_type?.includes('pdf')).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search files..."
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="size">Size</option>
                  <option value="type">Type</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-md ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-md ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {selectedFiles.length} selected
                </span>
                <button
                  onClick={selectAllFiles}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedFiles.length === filteredFiles.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Files Display */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <FileCard key={file.file_id} file={file} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload some files or adjust your search criteria.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={selectAllFiles}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <FileRow key={file.file_id} file={file} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No files found. Upload some files or adjust your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default FileManagement;