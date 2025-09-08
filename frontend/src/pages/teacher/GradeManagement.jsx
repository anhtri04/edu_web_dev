import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Search, 
  Filter, 
  Download,
  Upload,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

const GradeManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGrades, setEditingGrades] = useState({});
  const [bulkGradeMode, setBulkGradeMode] = useState(false);

  // Fetch teacher's classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses', user?.id],
    queryFn: () => teacherService.getClasses(user?.id),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Fetch students for grade management
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacherStudents', user?.id, selectedClass],
    queryFn: () => teacherService.getStudents(user?.id, 
      selectedClass !== 'all' ? { classId: selectedClass } : {}
    ),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  const isLoading = classesLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const { classes = [] } = classesData || {};
  const { students = [] } = studentsData || {};

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleGradeEdit = (studentId, examId, value) => {
    setEditingGrades(prev => ({
      ...prev,
      [`${studentId}-${examId}`]: value
    }));
  };

  const handleSaveGrade = async (studentId, examId) => {
    const gradeValue = editingGrades[`${studentId}-${examId}`];
    if (gradeValue !== undefined) {
      // Here you would call the API to save the grade
      console.log('Saving grade:', { studentId, examId, grade: gradeValue });
      
      // Remove from editing state
      setEditingGrades(prev => {
        const newState = { ...prev };
        delete newState[`${studentId}-${examId}`];
        return newState;
      });
    }
  };

  const handleBulkGradeUpload = () => {
    // Implement bulk grade upload functionality
    console.log('Bulk grade upload');
  };

  const handleExportGrades = () => {
    // Implement grade export functionality
    console.log('Export grades');
  };

  const GradeCell = ({ student, exam, currentGrade }) => {
    const key = `${student.id}-${exam.id}`;
    const isEditing = editingGrades.hasOwnProperty(key);
    const editValue = editingGrades[key];

    return (
      <div className="relative">
        {isEditing ? (
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              max="100"
              value={editValue}
              onChange={(e) => handleGradeEdit(student.id, exam.id, e.target.value)}
              className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => handleSaveGrade(student.id, exam.id)}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <Save className="w-3 h-3" />
            </button>
            <button
              onClick={() => setEditingGrades(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
              })}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50 p-1 rounded"
            onClick={() => handleGradeEdit(student.id, exam.id, currentGrade || '')}
          >
            <span className={`text-sm font-medium ${
              currentGrade >= 90 ? 'text-green-600' :
              currentGrade >= 80 ? 'text-blue-600' :
              currentGrade >= 70 ? 'text-yellow-600' :
              currentGrade >= 60 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {currentGrade || '-'}
            </span>
            <Edit3 className="w-3 h-3 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />
          </div>
        )}
      </div>
    );
  };

  // Mock exam data for demonstration
  const mockExams = [
    { id: 1, title: 'Midterm Exam', maxScore: 100, date: '2024-03-15' },
    { id: 2, title: 'Final Exam', maxScore: 100, date: '2024-05-20' },
    { id: 3, title: 'Quiz 1', maxScore: 50, date: '2024-02-10' },
    { id: 4, title: 'Project', maxScore: 100, date: '2024-04-25' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="w-6 h-6 mr-2" />
            Grade Management
          </h1>
          <p className="text-gray-600 mt-1">Input and manage student grades</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleBulkGradeUpload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={handleExportGrades}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Grades
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {filteredStudents.length} Students
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bulkGradeMode}
                onChange={(e) => setBulkGradeMode(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Bulk Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  {mockExams.map(exam => (
                    <th key={exam.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div>
                        <div>{exam.title}</div>
                        <div className="text-xs text-gray-400 normal-case">
                          Max: {exam.maxScore}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letter Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => {
                  // Mock grades for demonstration
                  const mockGrades = {
                    1: Math.floor(Math.random() * 40) + 60, // 60-100
                    2: Math.floor(Math.random() * 40) + 60,
                    3: Math.floor(Math.random() * 20) + 30,  // 30-50
                    4: Math.floor(Math.random() * 40) + 60
                  };
                  
                  const average = Object.values(mockGrades).reduce((a, b) => a + b, 0) / Object.keys(mockGrades).length;
                  const letterGrade = average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F';
                  
                  return (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-inherit">
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
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.class?.name || 'Multiple Classes'}
                      </td>
                      {mockExams.map(exam => (
                        <td key={exam.id} className="px-4 py-4 whitespace-nowrap text-center group">
                          <GradeCell 
                            student={student} 
                            exam={exam} 
                            currentGrade={mockGrades[exam.id]} 
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-medium ${
                          average >= 90 ? 'text-green-600' :
                          average >= 80 ? 'text-blue-600' :
                          average >= 70 ? 'text-yellow-600' :
                          average >= 60 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {average.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                          letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                          letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {letterGrade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No students match your search criteria.' : 'No students are enrolled in your classes yet.'}
          </p>
        </div>
      )}

      {/* Grade Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Grading Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>A: 90-100%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>B: 80-89%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>C: 70-79%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>D: 60-69%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>F: Below 60%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;