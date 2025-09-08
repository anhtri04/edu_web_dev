import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Import pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CoursesPage from './pages/student/CoursesPage';
import GradesPage from './pages/student/GradesPage';
import ExamsPage from './pages/student/ExamsPage';
import TeacherClassesPage from './pages/teacher/TeacherClassesPage';
import TeacherGradesPage from './pages/teacher/TeacherGradesPage';
import TeacherExamsPage from './pages/teacher/TeacherExamsPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import TeacherFilesPage from './pages/teacher/TeacherFilesPage';
import CalendarPage from './pages/shared/CalendarPage';
import FilesPage from './pages/shared/FilesPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';

// Import components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Protected routes with layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  {/* Default redirect based on user role */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Student routes */}
                  <Route path="dashboard" element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="courses" element={
                    <ProtectedRoute requiredRole="student">
                      <CoursesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="grades" element={
                    <ProtectedRoute requiredRole="student">
                      <GradesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="exams" element={
                    <ProtectedRoute requiredRole="student">
                      <ExamsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Teacher routes */}
                  <Route path="teacher" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="teacher/classes" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherClassesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="teacher/grades" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherGradesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="teacher/exams" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherExamsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="teacher/analytics" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherAnalyticsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="teacher/files" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherFilesPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Shared routes */}
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;