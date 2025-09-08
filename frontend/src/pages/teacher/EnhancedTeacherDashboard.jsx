import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Target,
  Activity,
  PieChart,
  User
} from 'lucide-react';

const EnhancedTeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current'); // current, last_month, last_semester

  // Fetch teacher dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['teacherDashboard', user?.id],
    queryFn: () => teacherService.getDashboard(user?.id),
    enabled: !!user?.id && user?.role === 'teacher',
    select: (response) => response.data.data
  });

  // Fetch teacher analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['teacherAnalytics', user?.id],
    queryFn: () => teacherService.getAnalytics(user?.id),
    enabled: !!user?.id && user?.role === 'teacher',
    select: (response) => response.data.data
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || user?.role !== 'teacher') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading teacher dashboard. Please try again later.
      </div>
    );
  }

  const {
    teacher = {},
    stats = {},
    recentExams = []
  } = dashboardData || {};

  const {
    classEnrollments = [],
    submissionStats = [],
    summary = {}
  } = analyticsData || {};

  // Map dashboard data to component variables
  const teaching_classes = classEnrollments || [];
  const total_students = summary.totalEnrollments || 0;
  const pending_exams = recentExams.length || 0;
  const pending_gradings = stats.pendingSubmissions || 0;
  const class_performance = {};
  const student_progress = [];
  const exam_statistics = { total_exams: stats.recentExams || 0 };
  const grade_distribution = {};
  const upcoming_classes = [];
  const recent_submissions = [];
  const analytics = {
    class_growth: 0,
    student_growth: 0,
    overall_attendance: 85,
    engagement_score: 75
  };
  const activities = [];

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', trend = null, subtitle = null }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 text-${color}-500`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(trend)}%
                  </div>
                )}
              </dd>
              {subtitle && (
                <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const ClassPerformanceChart = ({ classData }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Class Performance Overview</h3>
      <div className="space-y-4">
        {teaching_classes.map((cls) => {
          const performance = classData[cls.class_id] || {};
          const averageGrade = performance.average_grade || 0;
          const attendanceRate = performance.attendance_rate || 0;
          
          return (
            <div key={cls.class_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{cls.class_name}</h4>
                <span className="text-sm text-gray-500">{cls.enrolled_count} students</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Average Grade</span>
                    <span className="font-medium">{averageGrade.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        averageGrade >= 80 ? 'bg-green-500' : 
                        averageGrade >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(averageGrade, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Attendance</span>
                    <span className="font-medium">{attendanceRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        attendanceRate >= 90 ? 'bg-green-500' : 
                        attendanceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const GradeDistributionChart = ({ distribution }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
      <div className="space-y-3">
        {Object.entries(distribution).map(([grade, count]) => (
          <div key={grade} className="flex items-center">
            <div className="w-8 text-sm font-medium text-gray-600">{grade}</div>
            <div className="flex-1 mx-3">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(count / Math.max(...Object.values(distribution))) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{count}</span>
                </div>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">
              {((count / Object.values(distribution).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const StudentProgressTable = ({ students }) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Student Progress Tracking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.slice(0, 10).map((student) => (
              <tr key={`${student.student_id}-${student.class_id}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {student.student_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.current_grade || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.attendance_rate || 0}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.performance_status === 'excellent' ? 'bg-green-100 text-green-800' :
                    student.performance_status === 'good' ? 'bg-blue-100 text-blue-800' :
                    student.performance_status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.performance_status || 'unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RecentActivities = ({ activities }) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activities.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2" />
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name}! Here's your teaching overview.</p>
          </div>
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current">Current Period</option>
              <option value="last_month">Last Month</option>
              <option value="last_semester">Last Semester</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Teaching Classes"
          value={teaching_classes.length}
          icon={BookOpen}
          color="blue"
          trend={analytics.class_growth}
          subtitle="Active courses"
        />
        <MetricCard
          title="Total Students"
          value={total_students}
          icon={Users}
          color="green"
          trend={analytics.student_growth}
          subtitle="Enrolled students"
        />
        <MetricCard
          title="Pending Exams"
          value={pending_exams}
          icon={FileText}
          color="yellow"
          subtitle="Need to be graded"
        />
        <MetricCard
          title="Pending Gradings"
          value={pending_gradings}
          icon={Clock}
          color="red"
          subtitle="Awaiting grades"
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassPerformanceChart classData={class_performance} />
        <GradeDistributionChart distribution={grade_distribution} />
      </div>

      {/* Exam Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Exam Statistics</h3>
              <div className="mt-2">
                <div className="text-2xl font-semibold text-gray-900">
                  {exam_statistics.total_exams || 0}
                </div>
                <div className="text-sm text-gray-500">Total exams created</div>
              </div>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Completed</div>
              <div className="font-medium">{exam_statistics.completed_exams || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">Average Score</div>
              <div className="font-medium">{exam_statistics.average_score || 0}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Class Attendance</h3>
              <div className="mt-2">
                <div className="text-2xl font-semibold text-gray-900">
                  {analytics.overall_attendance || 0}%
                </div>
                <div className="text-sm text-gray-500">Overall attendance rate</div>
              </div>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min(analytics.overall_attendance || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Student Engagement</h3>
              <div className="mt-2">
                <div className="text-2xl font-semibold text-gray-900">
                  {analytics.engagement_score || 0}%
                </div>
                <div className="text-sm text-gray-500">Based on participation</div>
              </div>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center space-x-2 text-sm">
            <div className={`px-2 py-1 rounded ${
              (analytics.engagement_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
              (analytics.engagement_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {(analytics.engagement_score || 0) >= 80 ? 'High' :
               (analytics.engagement_score || 0) >= 60 ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Classes & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Classes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcoming_classes.slice(0, 5).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cls.class_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(cls.scheduled_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{cls.duration || '60'} min</span>
                </div>
              ))}
              {upcoming_classes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No upcoming classes.</p>
              )}
            </div>
          </div>
        </div>

        <RecentActivities activities={activities} />
      </div>

      {/* Student Progress Table */}
      <StudentProgressTable students={student_progress} />
    </div>
  );
};

export default EnhancedTeacherDashboard;