import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3000',
    VITE_APP_NAME: 'EDU Web Management System',
    VITE_ENVIRONMENT: 'test'
  }
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Setup test helpers
global.testHelpers = {
  // Mock user data
  mockStudent: {
    user_id: 1,
    username: 'teststudent',
    email: 'student@test.com',
    first_name: 'Test',
    last_name: 'Student',
    user_type: 'student'
  },

  mockTeacher: {
    user_id: 2,
    username: 'testteacher',
    email: 'teacher@test.com',
    first_name: 'Test',
    last_name: 'Teacher',
    user_type: 'teacher',
    department: 'Computer Science'
  },

  mockAdmin: {
    user_id: 3,
    username: 'testadmin',
    email: 'admin@test.com',
    first_name: 'Test',
    last_name: 'Admin',
    user_type: 'admin'
  },

  // Mock API responses
  mockApiResponse: (data, success = true) => ({
    json: () => Promise.resolve({ success, data }),
    ok: success,
    status: success ? 200 : 400
  }),

  // Mock courses data
  mockCourses: [
    {
      course_id: 1,
      course_name: 'Introduction to Computer Science',
      course_code: 'CS101',
      credits: 3,
      Teacher: { first_name: 'John', last_name: 'Doe' }
    },
    {
      course_id: 2,
      course_name: 'Data Structures',
      course_code: 'CS201',
      credits: 4,
      Teacher: { first_name: 'Jane', last_name: 'Smith' }
    }
  ],

  // Mock grades data
  mockGrades: [
    {
      grade_id: 1,
      grade: 'A',
      points: 95,
      Course: { course_name: 'Introduction to Computer Science' }
    },
    {
      grade_id: 2,
      grade: 'B+',
      points: 87,
      Course: { course_name: 'Data Structures' }
    }
  ],

  // Mock notifications
  mockNotifications: [
    {
      notification_id: 1,
      title: 'New Assignment',
      message: 'A new assignment has been posted',
      type: 'assignment',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      notification_id: 2,
      title: 'Grade Posted',
      message: 'Your grade has been posted',
      type: 'grade',
      is_read: true,
      created_at: new Date().toISOString()
    }
  ],

  // Mock calendar events
  mockEvents: [
    {
      event_id: 1,
      title: 'Midterm Exam',
      start_date: '2024-03-15T10:00:00Z',
      end_date: '2024-03-15T12:00:00Z',
      event_type: 'exam',
      color: '#ff6b6b'
    }
  ]
}

console.log('Frontend test setup completed successfully')