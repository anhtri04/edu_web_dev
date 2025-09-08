import apiClient from './apiClient';

export const studentService = {
  // Dashboard
  getDashboard: (studentId) => {
    return apiClient.get(`/api/student/${studentId}/dashboard`);
  },

  // Courses
  getEnrolledCourses: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/courses`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  getAvailableCourses: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/courses/available`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  enrollInCourse: (studentId, courseData) => {
    return apiClient.post(`/api/student/${studentId}/courses/enroll`, courseData);
  },

  // Grades
  getGrades: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/grades`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Submissions
  getSubmissions: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/submissions`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Profile
  updateProfile: (studentId, profileData) => {
    return apiClient.put(`/api/student/${studentId}/profile`, profileData);
  },

  // Calendar
  getCalendarEvents: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/calendar`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Files
  getFiles: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/files`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },
};

export const teacherService = {
  // Dashboard
  getDashboard: (teacherId) => {
    return apiClient.get(`/api/teacher/${teacherId}/dashboard`);
  },

  // Classes
  getClasses: (teacherId, params = {}) => {
    return apiClient.get(`/api/teacher/${teacherId}/classes`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  createClass: (teacherId, classData) => {
    return apiClient.post(`/api/teacher/${teacherId}/classes`, classData);
  },

  updateClass: (teacherId, classId, classData) => {
    return apiClient.put(`/api/teacher/${teacherId}/classes/${classId}`, classData);
  },

  // Students
  getStudents: (teacherId, params = {}) => {
    return apiClient.get(`/api/teacher/${teacherId}/students`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Exams
  getExams: (teacherId, params = {}) => {
    return apiClient.get(`/api/teacher/${teacherId}/exams`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  createExam: (teacherId, examData) => {
    return apiClient.post(`/api/teacher/${teacherId}/exams`, examData);
  },

  // Grading
  gradeSubmission: (teacherId, submissionId, gradeData) => {
    return apiClient.post(`/api/teacher/${teacherId}/grade/${submissionId}`, gradeData);
  },

  // Analytics
  getAnalytics: (teacherId, params = {}) => {
    return apiClient.get(`/api/teacher/${teacherId}/analytics`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Student Analytics (specific endpoint for teacher analytics dashboard)
  getStudentAnalytics: (teacherId, params = {}) => {
    return apiClient.get(`/api/teacher/${teacherId}/analytics`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Get individual student details
  getStudentDetails: (studentId, params = {}) => {
    return apiClient.get(`/api/student/${studentId}/details`, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },
};

export const adminService = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/admin/dashboard');
  },

  // Users
  getStudents: (params = {}) => {
    return apiClient.get('/api/admin/students', { params });
  },

  getTeachers: (params = {}) => {
    return apiClient.get('/api/admin/teachers', { params });
  },

  createStudent: (studentData) => {
    return apiClient.post('/api/admin/students', studentData);
  },

  createTeacher: (teacherData) => {
    return apiClient.post('/api/admin/teachers', teacherData);
  },

  updateUserStatus: (userType, userId, statusData) => {
    return apiClient.put(`/api/admin/users/${userType}/${userId}/status`, statusData);
  },

  deleteUser: (userType, userId) => {
    return apiClient.delete(`/api/admin/users/${userType}/${userId}`);
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/admin/stats', { params });
  },

  // Bulk operations
  sendBulkNotification: (notificationData) => {
    return apiClient.post('/api/admin/notifications/bulk', notificationData);
  },
};

export const notificationService = {
  // Get notifications
  getNotifications: (params = {}) => {
    return apiClient.get('/api/notifications', { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Create notification
  createNotification: (notificationData) => {
    return apiClient.post('/api/notifications', notificationData);
  },

  // Mark as read
  markAsRead: (notificationId) => {
    return apiClient.put(`/api/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead: (userData) => {
    return apiClient.put('/api/notifications/mark-all-read', userData);
  },

  // Get unread count
  getUnreadCount: (params = {}) => {
    return apiClient.get('/api/notifications/unread-count', { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Delete notification
  deleteNotification: (notificationId) => {
    return apiClient.delete(`/api/notifications/${notificationId}`);
  },

  // Bulk create
  createBulkNotifications: (notificationData) => {
    return apiClient.post('/api/notifications/bulk', notificationData);
  },
};

export const calendarService = {
  // Get events
  getEvents: (params = {}) => {
    return apiClient.get('/api/calendar/events', { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Create event
  createEvent: (eventData) => {
    return apiClient.post('/api/calendar/events', eventData);
  },

  // Update event
  updateEvent: (eventId, eventData) => {
    return apiClient.put(`/api/calendar/events/${eventId}`, eventData);
  },

  // Delete event
  deleteEvent: (eventId) => {
    return apiClient.delete(`/api/calendar/events/${eventId}`);
  },

  // Get upcoming events
  getUpcomingEvents: (params = {}) => {
    return apiClient.get('/api/calendar/events/upcoming', { params });
  },

  // Get events by month
  getEventsByMonth: (params = {}) => {
    return apiClient.get('/api/calendar/events/month', { params });
  },

  // Get event by ID
  getEventById: (eventId) => {
    return apiClient.get(`/api/calendar/events/${eventId}`);
  },
};

export const fileService = {
  // Upload file
  uploadFile: (formData) => {
    return apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Bulk upload
  bulkUpload: (formData) => {
    return apiClient.post('/api/files/upload/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get files
  getFiles: (params = {}) => {
    return apiClient.get('/api/files', { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Get file by ID
  getFileById: (fileId) => {
    return apiClient.get(`/api/files/${fileId}`);
  },

  // Download file
  downloadFile: (fileId) => {
    return apiClient.get(`/api/files/${fileId}/download`, {
      responseType: 'blob',
    });
  },

  // Update file
  updateFile: (fileId, fileData) => {
    return apiClient.put(`/api/files/${fileId}`, fileData);
  },

  // Delete file
  deleteFile: (fileId) => {
    return apiClient.delete(`/api/files/${fileId}`);
  },

  // Get files by folder
  getFilesByFolder: (folderPath, params = {}) => {
    return apiClient.get(`/api/files/folder/${encodeURIComponent(folderPath)}`, { params });
  },

  // Get file statistics
  getFileStats: (params = {}) => {
    return apiClient.get('/api/files/stats/summary', { params });
  },

  // Teacher-specific file methods
  getTeacherFiles: (teacherId, folderId = null, params = {}) => {
    const url = folderId 
      ? `/api/teacher/${teacherId}/files/${folderId}`
      : `/api/teacher/${teacherId}/files`;
    return apiClient.get(url, { 
      params: params && typeof params === 'object' ? params : {} 
    });
  },

  // Create folder
  createFolder: (folderData) => {
    return apiClient.post('/api/files/folders', folderData);
  },

  // Share file
  shareFile: (fileId, shareData) => {
    return apiClient.post(`/api/files/${fileId}/share`, shareData);
  },
};