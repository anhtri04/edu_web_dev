import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar,
  Clock,
  MapPin,
  Award
} from 'lucide-react';

const ClassManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
    semester: '',
    max_students: 30,
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch teacher's classes
  const { data: classesData, isLoading, error } = useQuery({
    queryKey: ['teacherClasses', user?.id],
    queryFn: () => teacherService.getClasses(user?.id),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: (classData) => teacherService.createClass(user?.id, classData),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherClasses', user?.id]);
      setShowCreateModal(false);
      setFormData({
        class_name: '',
        description: '',
        semester: '',
        max_students: 30,
        password: ''
      });
      setFormErrors({});
    },
    onError: (error) => {
      console.error('Create class failed:', error);
      setFormErrors({ submit: error.response?.data?.message || 'Failed to create class' });
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
        Error loading classes. Please try again later.
      </div>
    );
  }

  const { classes = [], pagination } = classesData || {};

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || cls.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  // Get unique semesters for filter
  const semesters = [...new Set(classes.map(cls => cls.semester).filter(Boolean))];

  const ClassCard = ({ classItem }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {classItem.name}
            </h3>
            {classItem.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {classItem.description}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingClass(classItem)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{classItem.semester}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>{classItem.currentStudents}/{classItem.maxStudents} Students</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>{classItem.meetingTime || 'TBD'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{classItem.location || 'TBD'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              classItem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {classItem.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-500">
              {classItem.credits} Credits
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.class_name.trim()) errors.class_name = 'Class name is required';
    if (!formData.semester.trim()) errors.semester = 'Semester is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    if (formData.password.length < 4) errors.password = 'Password must be at least 4 characters';
    if (formData.max_students < 1) errors.max_students = 'Max students must be at least 1';
    return errors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    createClassMutation.mutate(formData);
  };

  const CreateClassModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Class</h3>
        
        {formErrors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {formErrors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.class_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter class name"
            />
            {formErrors.class_name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.class_name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter class description"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select 
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.semester ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select semester</option>
                <option value="Spring 2025">Spring 2025</option>
                <option value="Fall 2024">Fall 2024</option>
                <option value="Summer 2025">Summer 2025</option>
              </select>
              {formErrors.semester && (
                <p className="text-red-500 text-xs mt-1">{formErrors.semester}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students
              </label>
              <input
                type="number"
                name="max_students"
                value={formData.max_students}
                onChange={handleInputChange}
                min="1"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.max_students ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="30"
              />
              {formErrors.max_students && (
                <p className="text-red-500 text-xs mt-1">{formErrors.max_students}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter class password"
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Students will need this password to join the class
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  class_name: '',
                  description: '',
                  semester: '',
                  max_students: 30,
                  password: ''
                });
                setFormErrors({});
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={createClassMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createClassMutation.isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createClassMutation.isLoading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Class Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage your classes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="w-4 h-4 mr-2" />
            {filteredClasses.length} Classes Found
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedSemester !== 'all' 
              ? 'No classes match your current filters.' 
              : 'You haven\'t created any classes yet.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Class
          </button>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && <CreateClassModal />}
    </div>
  );
};

export default ClassManagement;