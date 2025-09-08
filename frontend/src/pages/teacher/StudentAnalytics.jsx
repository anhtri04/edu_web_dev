import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Download,
  Search,
  User,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const StudentAnalytics = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('all');
  const [timeRange, setTimeRange] = useState('current_semester');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teacher's classes
  const { data: classesData } = useQuery({
    queryKey: ['teacherClasses', user?.id],
    queryFn: () => teacherService.getClasses(user?.id),
    enabled: !!user?.id && user?.role === 'teacher',
    select: (response) => response.data.data || []
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['studentAnalytics', user?.id, selectedClass, timeRange],
    queryFn: () => teacherService.getStudentAnalytics(user?.id, { 
      class_id: selectedClass !== 'all' ? selectedClass : undefined,
      time_range: timeRange 
    }),
    enabled: !!user?.id && user?.role === 'teacher',
    select: (response) => response.data.data || {}
  });

  // Fetch individual student details when selected
  const { data: studentDetails } = useQuery({
    queryKey: ['studentDetails', selectedStudent],
    queryFn: () => teacherService.getStudentDetails(selectedStudent),
    enabled: !!selectedStudent,
    select: (response) => response.data.data
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const {
    overview = {},
    students = [],
    performance_trends = [],
    class_comparison = {},
    grade_distribution = {}
  } = analyticsData;

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id?.toString().includes(searchQuery)
  );

  const OverviewCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end">
          <Icon className={`h-8 w-8 text-${color}-500`} />
          {trend && (
            <div className={`flex items-center mt-2 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PerformanceChart = ({ trends }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
      <div className="space-y-4">
        {trends.slice(0, 5).map((trend, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{trend.period}</span>
                <span className="text-sm text-gray-600">{trend.average_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    trend.average_score >= 80 ? 'bg-green-500' : 
                    trend.average_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(trend.average_score, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const GradeDistributionChart = ({ distribution }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
      <div className="space-y-3">
        {Object.entries(distribution).map(([grade, data]) => (
          <div key={grade} className="flex items-center">
            <div className="w-8 text-sm font-medium text-gray-600">{grade}</div>
            <div className="flex-1 mx-3">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(data.count / data.total) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{data.count}</span>
                </div>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">
              {((data.count / data.total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const StudentListTable = ({ students }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.student_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {student.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.current_grade || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{student.letter_grade || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{student.attendance_rate || 0}%</div>
                    {student.attendance_rate >= 90 ? (
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                    ) : student.attendance_rate >= 75 ? (
                      <Clock className="ml-2 h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.participation_score >= 80 ? 'bg-green-100 text-green-800' :
                    student.participation_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.participation_level || 'Average'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {student.performance_trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : student.performance_trend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <div className="h-4 w-4 mr-1"></div>
                    )}
                    <span className="text-sm text-gray-600">
                      {student.performance_trend !== 0 ? `${Math.abs(student.performance_trend)}%` : 'Stable'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedStudent(student.student_id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StudentDetailModal = ({ student, onClose }) => {
    if (!student) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Student Details: {student.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Academic Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Grade:</span>
                  <span className="font-medium">{student.current_grade || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Letter Grade:</span>
                  <span className="font-medium">{student.letter_grade || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class Rank:</span>
                  <span className="font-medium">{student.class_rank || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Engagement Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance Rate:</span>
                  <span className="font-medium">{student.attendance_rate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participation:</span>
                  <span className="font-medium">{student.participation_level || 'Average'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assignment Completion:</span>
                  <span className="font-medium">{student.assignment_completion || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              {student.recent_activities?.length > 0 ? (
                <ul className="space-y-2">
                  {student.recent_activities.map((activity, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      <span className="font-medium">{activity.date}:</span> {activity.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent activities recorded.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Student Analytics
            </h1>
            <p className="text-gray-600">Track student progress and performance metrics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              {classesData?.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current_semester">Current Semester</option>
              <option value="last_month">Last Month</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="academic_year">Academic Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          title="Total Students"
          value={overview.total_students || 0}
          subtitle="Active students"
          icon={Users}
          color="blue"
        />
        <OverviewCard
          title="Average Grade"
          value={`${overview.average_grade || 0}%`}
          subtitle="Class performance"
          icon={Award}
          trend={overview.grade_trend}
          color="green"
        />
        <OverviewCard
          title="Attendance Rate"
          value={`${overview.attendance_rate || 0}%`}
          subtitle="Overall attendance"
          icon={Calendar}
          trend={overview.attendance_trend}
          color="yellow"
        />
        <OverviewCard
          title="At Risk Students"
          value={overview.at_risk_students || 0}
          subtitle="Need attention"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart trends={performance_trends} />
        <GradeDistributionChart distribution={grade_distribution} />
      </div>

      {/* Student List */}
      <StudentListTable students={filteredStudents} />

      {/* Student Detail Modal */}
      {selectedStudent && studentDetails && (
        <StudentDetailModal
          student={studentDetails}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default StudentAnalytics;