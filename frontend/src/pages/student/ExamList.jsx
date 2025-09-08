import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FileText, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Upload,
  Download,
  Search,
  Filter,
  ChevronDown,
  FileCheck,
  Timer
} from 'lucide-react';

const ExamList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, upcoming, completed, submitted
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionData, setSubmissionData] = useState({});

  // Fetch exams
  const { data: examsData, isLoading, error } = useQuery({
    queryKey: ['studentExams', user?.id, selectedStatus, selectedCourse],
    queryFn: () => studentService.getExams(user?.id, {
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      class_id: selectedCourse !== 'all' ? selectedCourse : undefined
    }),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Fetch submissions
  const { data: submissionsData } = useQuery({
    queryKey: ['studentSubmissions', user?.id],
    queryFn: () => studentService.getSubmissions(user?.id),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: ({ examId, file, answer }) => {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (answer) formData.append('answer', answer);
      formData.append('student_id', user.id);
      formData.append('exam_id', examId);
      
      return studentService.submitExam(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studentSubmissions']);
      queryClient.invalidateQueries(['studentExams']);
      setSelectedFile(null);
      setSubmissionData({});
    },
    onError: (error) => {
      console.error('Submission failed:', error);
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
        Error loading exams. Please try again later.
      </div>
    );
  }

  const { exams = [], courses = [] } = examsData || {};
  const { submissions = [] } = submissionsData || {};

  // Create submission map for quick lookup
  const submissionMap = submissions.reduce((acc, submission) => {
    acc[submission.exam_id] = submission;
    return acc;
  }, {});

  // Filter exams
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === 'all' || exam.class_id.toString() === selectedCourse;
    
    const now = new Date();
    const examDate = new Date(exam.exam_date);
    const isUpcoming = examDate > now;
    const isCompleted = examDate <= now;
    const isSubmitted = submissionMap[exam.exam_id];
    
    let matchesStatus = true;
    if (selectedStatus === 'upcoming') matchesStatus = isUpcoming;
    else if (selectedStatus === 'completed') matchesStatus = isCompleted;
    else if (selectedStatus === 'submitted') matchesStatus = isSubmitted;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.exam_date);
    const submission = submissionMap[exam.exam_id];
    
    if (submission) {
      return {
        status: 'submitted',
        color: 'green',
        icon: CheckCircle,
        text: 'Submitted'
      };
    } else if (examDate > now) {
      return {
        status: 'upcoming',
        color: 'blue',
        icon: Timer,
        text: 'Upcoming'
      };
    } else {
      return {
        status: 'overdue',
        color: 'red',
        icon: XCircle,
        text: 'Overdue'
      };
    }
  };

  const handleFileSubmission = async (examId) => {
    if (!selectedFile && !submissionData[examId]?.answer) return;
    
    try {
      await submitExamMutation.mutateAsync({
        examId,
        file: selectedFile,
        answer: submissionData[examId]?.answer
      });
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const handleAnswerChange = (examId, answer) => {
    setSubmissionData(prev => ({
      ...prev,
      [examId]: { ...prev[examId], answer }
    }));
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const ExamCard = ({ exam }) => {
    const examStatus = getExamStatus(exam);
    const StatusIcon = examStatus.icon;
    const submission = submissionMap[exam.exam_id];
    const isSubmissionOpen = examStatus.status === 'upcoming' || (examStatus.status === 'overdue' && !submission);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {exam.exam_name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>{exam.class_name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                <Clock className="w-4 h-4 ml-4 mr-2" />
                <span>{new Date(exam.exam_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              {exam.duration && (
                <div className="flex items-center text-sm text-gray-500">
                  <Timer className="w-4 h-4 mr-2" />
                  <span>Duration: {formatDuration(exam.duration)}</span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${examStatus.color}-100 text-${examStatus.color}-800`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {examStatus.text}
              </span>
            </div>
          </div>

          {exam.description && (
            <p className="text-gray-600 text-sm mb-4">
              {exam.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Total Score</div>
              <div className="text-lg font-semibold">{exam.total_score || 100}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Exam Type</div>
              <div className="text-sm font-medium capitalize">{exam.exam_type || 'Regular'}</div>
            </div>
          </div>

          {/* Submission Status */}
          {submission && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <FileCheck className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Submitted</span>
              </div>
              <div className="text-sm text-green-700">
                <p>Submitted on: {new Date(submission.submitted_at).toLocaleString()}</p>
                {submission.file_url && (
                  <div className="mt-2">
                    <a 
                      href={submission.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View Submission
                    </a>
                  </div>
                )}
                {submission.grade && (
                  <p className="mt-1">Grade: {submission.score}/{submission.total_score} ({submission.grade})</p>
                )}
              </div>
            </div>
          )}

          {/* Submission Form */}
          {isSubmissionOpen && !submission && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Submit Your Exam</h4>
              
              {/* Text Answer */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Written Answer (Optional)
                </label>
                <textarea
                  value={submissionData[exam.exam_id]?.answer || ''}
                  onChange={(e) => handleAnswerChange(exam.exam_id, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your answer here..."
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleFileSubmission(exam.exam_id)}
                disabled={submitExamMutation.isLoading || (!selectedFile && !submissionData[exam.exam_id]?.answer)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitExamMutation.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Exam
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <p className="text-gray-600">View and submit your exams</p>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Exams</dt>
                  <dd className="text-lg font-medium text-gray-900">{exams.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Timer className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {exams.filter(exam => new Date(exam.exam_date) > new Date()).length}
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
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Submitted</dt>
                  <dd className="text-lg font-medium text-gray-900">{submissions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {exams.filter(exam => new Date(exam.exam_date) <= new Date() && !submissionMap[exam.exam_id]).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search exams..."
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="submitted">Submitted</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Course Filter */}
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.class_id} value={course.class_id}>
                    {course.class_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <ExamCard key={exam.exam_id} exam={exam} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;