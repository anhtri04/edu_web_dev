// Test setup file for API tests
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:'; // Use in-memory SQLite for tests

// Global test configuration
global.testConfig = {
  timeout: 30000,
  apiBaseUrl: 'http://localhost:3000/api',
  dbConfig: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false, // Disable SQL logging in tests
    sync: { force: true }
  }
};

// Global test helpers
global.testHelpers = {
  // Create test user data
  createUserData: (type = 'student', overrides = {}) => {
    const baseData = {
      username: `test${type}${Date.now()}`,
      email: `${type}${Date.now()}@test.com`,
      password: 'password123',
      first_name: 'Test',
      last_name: type.charAt(0).toUpperCase() + type.slice(1),
      user_type: type
    };

    if (type === 'teacher') {
      baseData.department = 'Computer Science';
    }

    return { ...baseData, ...overrides };
  },

  // Create test course data
  createCourseData: (overrides = {}) => ({
    course_name: `Test Course ${Date.now()}`,
    course_code: `TC${Date.now()}`,
    description: 'Test course description',
    credits: 3,
    semester: 'Fall 2024',
    ...overrides
  }),

  // Create test notification data
  createNotificationData: (overrides = {}) => ({
    title: `Test Notification ${Date.now()}`,
    message: 'This is a test notification message',
    type: 'announcement',
    is_global: true,
    ...overrides
  }),

  // Create test exam data
  createExamData: (overrides = {}) => ({
    exam_name: `Test Exam ${Date.now()}`,
    exam_date: new Date(Date.now() + 86400000), // Tomorrow
    duration: 120,
    total_marks: 100,
    ...overrides
  }),

  // Create test calendar event data
  createEventData: (overrides = {}) => ({
    title: `Test Event ${Date.now()}`,
    description: 'Test event description',
    start_date: new Date(),
    end_date: new Date(Date.now() + 3600000), // 1 hour later
    event_type: 'class',
    ...overrides
  }),

  // Wait helper for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Validate response structure
  validateApiResponse: (response, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response.body.success).toBe(true);
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    }
  },

  // Validate pagination response
  validatePaginationResponse: (response) => {
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  }
};

// Global beforeEach setup
beforeEach(() => {
  // Reset environment variables
  process.env.NODE_ENV = 'test';
});

// Global afterEach cleanup
afterEach(async () => {
  // Add any global cleanup here if needed
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

console.log('Test setup completed successfully');