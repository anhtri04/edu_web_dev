import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  ChevronDown,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';

const CourseList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [enrollmentStatus, setEnrollmentStatus] = useState('all'); // all, enrolled, available

  // Fetch enrolled courses
  const { data: enrolledCoursesData, isLoading: enrolledLoading } = useQuery({
    queryKey: ['studentEnrolledCourses', user?.id],
    queryFn: () => studentService.getEnrolledCourses(user?.id),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Fetch available courses
  const { data: availableCoursesData, isLoading: availableLoading } = useQuery({
    queryKey: ['studentAvailableCourses', user?.id],
    queryFn: () => studentService.getAvailableCourses(user?.id),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: (classId) => studentService.enrollInCourse(user?.id, classId),
    onSuccess: () => {
      queryClient.invalidateQueries(['studentEnrolledCourses']);
      queryClient.invalidateQueries(['studentAvailableCourses']);
      queryClient.invalidateQueries(['studentDashboard']);
    },
    onError: (error) => {
      console.error('Enrollment failed:', error);
    }
  });

  const isLoading = enrolledLoading || availableLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const { enrolled_courses = [] } = enrolledCoursesData || {};
  const { available_courses = [] } = availableCoursesData || {};

  // Combine and filter courses based on enrollment status
  let allCourses = [];
  if (enrollmentStatus === 'enrolled') {
    allCourses = enrolled_courses.map(course => ({...course, isEnrolled: true}));
  } else if (enrollmentStatus === 'available') {
    allCourses = available_courses.map(course => ({...course, isEnrolled: false}));
  } else {
    allCourses = [
      ...enrolled_courses.map(course => ({...course, isEnrolled: true})),
      ...available_courses.map(course => ({...course, isEnrolled: false}))
    ];
  }

  // Apply filters
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = selectedSemester === 'all' || course.semester === selectedSemester;
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    
    return matchesSearch && matchesSemester && matchesDepartment;
  });

  // Get unique departments and semesters for filters
  const departments = [...new Set(allCourses.map(course => course.department).filter(Boolean))];
  const semesters = [...new Set(allCourses.map(course => course.semester).filter(Boolean))];

  const handleEnroll = async (classId) => {
    try {
      await enrollMutation.mutateAsync(classId);
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {course.imageUrl && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={course.imageUrl} 
            alt={course.class_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {course.class_name}
          </h3>
          <div className="ml-2 flex-shrink-0">
            {course.isEnrolled ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enrolled
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Available
              </span>
            )}
          </div>
        </div>

        {course.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-2" />
            <span>Instructor: {course.teacher_name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Semester: {course.semester}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Duration: {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Students: {course.enrolled_count || 0}</span>
              {course.max_students && (
                <span>/{course.max_students}</span>
              )}
            </div>
            {course.department && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {course.department}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {course.max_students && course.enrolled_count >= course.max_students ? (
              <span className="text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                Class Full
              </span>
            ) : !course.isEnrolled ? (
              <span className="text-green-600">Available</span>
            ) : null}
          </div>
          
          {!course.isEnrolled && (
            <button
              onClick={() => handleEnroll(course.class_id)}
              disabled={enrollMutation.isLoading || (course.max_students && course.enrolled_count >= course.max_students)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrollMutation.isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Enroll
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">Manage your course enrollments and explore available courses</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Enrolled Courses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {enrolled_courses.length}
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
                <Plus className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Courses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {available_courses.length}
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
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Courses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {allCourses.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search courses, instructors, or descriptions..."
                />
              </div>
            </div>

            {/* Enrollment Status Filter */}
            <div className="relative">
              <select
                value={enrollmentStatus}
                onChange={(e) => setEnrollmentStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="enrolled">Enrolled</option>
                <option value="available">Available</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Semester Filter */}
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Semesters</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard key={course.class_id} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;