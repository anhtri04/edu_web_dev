import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpen, GraduationCap, BarChart3, Calendar, Bell, FileText } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['studentDashboard', user?.id],
    queryFn: () => studentService.getDashboard(user?.id),
    enabled: !!user?.id && user?.role === 'student',
    select: (response) => response.data.data
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
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  const {
    student = {},
    enrolled_classes = [],
    upcoming_exams = [],
    recent_grades = [],
    unread_notifications = 0,
    upcoming_events = [],
    stats = {}
  } = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's what's happening in your courses today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Enrolled Courses Card */}
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
                    {enrolled_classes.length} Active
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Exams Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Exams
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {upcoming_exams.length} This Week
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Grades Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Grades
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {recent_grades.length} New
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Notifications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {unread_notifications} Unread
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              My Courses
            </h3>
            {enrolled_classes.length > 0 ? (
              <div className="space-y-3">
                {enrolled_classes.slice(0, 4).map((course) => (
                  <div key={course.class_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{course.class_name}</p>
                        <p className="text-xs text-gray-500">{course.teacher_name}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{course.semester}</span>
                  </div>
                ))}
                {enrolled_classes.length > 4 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    And {enrolled_classes.length - 4} more courses...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No enrolled courses yet.</p>
            )}
          </div>
        </div>
        
        {/* Upcoming Exams */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Upcoming Exams
            </h3>
            {upcoming_exams.length > 0 ? (
              <div className="space-y-3">
                {upcoming_exams.slice(0, 4).map((exam) => (
                  <div key={exam.exam_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exam.exam_name}</p>
                      <p className="text-xs text-gray-500">{exam.class_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-red-600 font-medium">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(exam.exam_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming exams.</p>
            )}
          </div>
        </div>
        
        {/* Recent Grades */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Grades
            </h3>
            {recent_grades.length > 0 ? (
              <div className="space-y-3">
                {recent_grades.slice(0, 4).map((grade) => (
                  <div key={grade.grading_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{grade.exam_name}</p>
                      <p className="text-xs text-gray-500">{grade.class_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{grade.score}/{grade.total_score}</p>
                      <p className="text-xs text-gray-400">{grade.letter_grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent grades.</p>
            )}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Upcoming Events
            </h3>
            {upcoming_events.length > 0 ? (
              <div className="space-y-3">
                {upcoming_events.slice(0, 4).map((event) => (
                  <div key={event.event_id} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.start_date).toLocaleDateString()} 
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;