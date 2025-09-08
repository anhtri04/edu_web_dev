import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { teacherService, fileService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FolderOpen,
  Upload,
  Download,
  Trash2,
  Eye,
  Edit3,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Share2,
  Calendar,
  User,
  X,
  Check,
  AlertCircle,
  FolderPlus
} from 'lucide-react';

const TeacherFileManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFilePreview, setShowFilePreview] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);

  // Fetch teacher's files and folders
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['teacherFiles', user?.id, selectedFolder],
    queryFn: () => fileService.getTeacherFiles(user?.id, selectedFolder),
    enabled: !!user?.id && user?.role === 'teacher',
    select: (response) => response.data.data || { files: [], folders: [] }
  });

  // Fetch teacher's classes for sharing
  const { data: classesData } = useQuery({
    queryKey: ['teacherClasses', user?.id],
    queryFn: () => teacherService.getClasses(user?.id),
    enabled: !!user?.id && user?.role === 'teacher',
    select: (response) => response.data.data || []
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => fileService.uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherFiles', user?.id]);
      setIsUploading(false);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (folderData) => fileService.createFolder(folderData),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherFiles', user?.id]);
      setShowNewFolderModal(false);
      setNewFolderName('');
    }
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherFiles', user?.id]);
      setSelectedFiles([]);
    }
  });

  // Share file mutation
  const shareMutation = useMutation({
    mutationFn: ({ fileId, shareData }) => fileService.shareFile(fileId, shareData),
    onSuccess: () => {
      setShowShareModal(null);
      // Show success notification
    }
  });

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    files.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teacher_id', user.id);
      formData.append('folder_id', selectedFolder || '');
      formData.append('category', 'course_material');
      
      uploadMutation.mutate(formData);
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    createFolderMutation.mutate({
      name: newFolderName,
      teacher_id: user.id,
      parent_folder_id: selectedFolder
    });
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length === 0) return;
    
    if (window.confirm(`Delete ${selectedFiles.length} selected file(s)?`)) {
      selectedFiles.forEach(fileId => {
        deleteMutation.mutate(fileId);
      });
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleShare = (file) => {
    setShowShareModal(file);
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    
    if (type.includes('image')) return <Image className="w-6 h-6 text-blue-500" />;
    if (type.includes('video')) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.includes('audio')) return <Music className="w-6 h-6 text-green-500" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-6 h-6 text-yellow-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = filesData?.files?.filter(file => {
    const matchesSearch = file.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type?.includes(filterType);
    return matchesSearch && matchesFilter;
  }) || [];

  const NewFolderModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Folder</h3>
          <button
            onClick={() => setShowNewFolderModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folder Name
          </label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter folder name"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowNewFolderModal(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || createFolderMutation.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createFolderMutation.isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );

  const ShareModal = ({ file }) => {
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [shareMessage, setShareMessage] = useState('');

    const handleClassSelect = (classId) => {
      setSelectedClasses(prev => 
        prev.includes(classId) 
          ? prev.filter(id => id !== classId)
          : [...prev, classId]
      );
    };

    const handleShareSubmit = () => {
      shareMutation.mutate({
        fileId: file.id,
        shareData: {
          class_ids: selectedClasses,
          message: shareMessage,
          teacher_id: user.id
        }
      });
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share File</h3>
            <button
              onClick={() => setShowShareModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Sharing: {file.name}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Classes
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
              {classesData?.map((cls) => (
                <div key={cls.class_id} className="flex items-center p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={`class-${cls.class_id}`}
                    checked={selectedClasses.includes(cls.class_id)}
                    onChange={() => handleClassSelect(cls.class_id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`class-${cls.class_id}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {cls.class_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Add a message for students..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowShareModal(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleShareSubmit}
              disabled={selectedClasses.length === 0 || shareMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {shareMutation.isLoading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FolderOpen className="w-6 h-6 mr-2" />
              File Management
            </h1>
            <p className="text-gray-600">Upload and organize course materials</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              New Folder
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="small" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Files
                </>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {selectedFiles.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedFiles.length} selected</span>
              <button
                onClick={handleDeleteSelected}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {selectedFolder && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => setSelectedFolder(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                Files
              </button>
            </li>
            <li className="flex items-center">
              <span className="text-gray-400">/</span>
              <span className="ml-4 text-gray-600">Current Folder</span>
            </li>
          </ol>
        </nav>
      )}

      {/* Files Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Folders */}
          {filesData?.folders?.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <FolderOpen className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                  {folder.name}
                </p>
                <p className="text-xs text-gray-500">{folder.file_count || 0} files</p>
              </div>
            </div>
          ))}
          
          {/* Files */}
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md"
            >
              <div className="flex flex-col items-center">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleFileSelect(file.id)}
                  className="absolute top-2 left-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="mb-2">
                  {getFileIcon(file.type)}
                </div>
                
                <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                  <button
                    onClick={() => handleShare(file)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowFilePreview(file)}
                    className="p-1 text-gray-400 hover:text-green-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
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
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{file.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(file)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowFilePreview(file)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this file?')) {
                            deleteMutation.mutate(file.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'Upload your first file to get started.'}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload Files
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNewFolderModal && <NewFolderModal />}
      {showShareModal && <ShareModal file={showShareModal} />}
    </div>
  );
};

export default TeacherFileManagement;