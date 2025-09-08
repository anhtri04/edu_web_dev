const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/db/index');

// Test suite for Student API endpoints
describe('Student API Tests', () => {
  let server;
  let agent;
  let studentAgent;
  let teacherAgent;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    server = app.listen(0);
    agent = request.agent(server);
  });

  afterAll(async () => {
    await sequelize.close();
    server.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    // Create and login student
    await agent.post('/api/auth/register').send({
      username: 'teststudent',
      email: 'student@test.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Student',
      user_type: 'student'
    });

    studentAgent = request.agent(server);
    await studentAgent.post('/api/auth/login').send({
      username: 'teststudent',
      password: 'password123'
    });

    // Create and login teacher
    await agent.post('/api/auth/register').send({
      username: 'testteacher',
      email: 'teacher@test.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Teacher',
      user_type: 'teacher',
      department: 'Computer Science'
    });

    teacherAgent = request.agent(server);
    await teacherAgent.post('/api/auth/login').send({
      username: 'testteacher',
      password: 'password123'
    });
  });

  describe('GET /api/student/dashboard', () => {
    test('should get student dashboard data', async () => {
      const response = await studentAgent
        .get('/api/student/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('enrolledCourses');
      expect(response.body.data).toHaveProperty('upcomingExams');
      expect(response.body.data).toHaveProperty('recentGrades');
      expect(response.body.data).toHaveProperty('notifications');
      expect(Array.isArray(response.body.data.enrolledCourses)).toBe(true);
    });

    test('should fail for non-student users', async () => {
      const response = await teacherAgent
        .get('/api/student/dashboard')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access denied. Students only.');
    });

    test('should fail when not authenticated', async () => {
      const response = await request(server)
        .get('/api/student/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/student/grades', () => {
    test('should get student grades', async () => {
      const response = await studentAgent
        .get('/api/student/grades')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('grades');
      expect(Array.isArray(response.body.grades)).toBe(true);
    });

    test('should filter grades by course', async () => {
      const response = await studentAgent
        .get('/api/student/grades?course_id=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('grades');
    });

    test('should fail for non-student users', async () => {
      await teacherAgent
        .get('/api/student/grades')
        .expect(403);
    });
  });

  describe('GET /api/student/courses', () => {
    test('should get enrolled courses', async () => {
      const response = await studentAgent
        .get('/api/student/courses')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    test('should include course details', async () => {
      const response = await studentAgent
        .get('/api/student/courses')
        .expect(200);

      // If courses exist, they should have proper structure
      if (response.body.courses.length > 0) {
        const course = response.body.courses[0];
        expect(course).toHaveProperty('course_id');
        expect(course).toHaveProperty('course_name');
        expect(course).toHaveProperty('Teacher');
      }
    });
  });

  describe('GET /api/student/exams', () => {
    test('should get student exams', async () => {
      const response = await studentAgent
        .get('/api/student/exams')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('exams');
      expect(Array.isArray(response.body.exams)).toBe(true);
    });

    test('should filter upcoming exams', async () => {
      const response = await studentAgent
        .get('/api/student/exams?filter=upcoming')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('exams');
    });

    test('should filter completed exams', async () => {
      const response = await studentAgent
        .get('/api/student/exams?filter=completed')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('exams');
    });
  });

  describe('POST /api/student/courses/enroll', () => {
    test('should enroll in a course', async () => {
      // This would typically require a course to exist first
      const enrollData = {
        course_id: 1
      };

      const response = await studentAgent
        .post('/api/student/courses/enroll')
        .send(enrollData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Successfully enrolled in course');
    });

    test('should fail to enroll in non-existent course', async () => {
      const enrollData = {
        course_id: 99999
      };

      const response = await studentAgent
        .post('/api/student/courses/enroll')
        .send(enrollData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should fail when missing course_id', async () => {
      const response = await studentAgent
        .post('/api/student/courses/enroll')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/student/exams/:id/submit', () => {
    test('should submit exam answers', async () => {
      const examId = 1;
      const submissionData = {
        answers: [
          { question_id: 1, answer: 'A' },
          { question_id: 2, answer: 'B' }
        ]
      };

      const response = await studentAgent
        .post(`/api/student/exams/${examId}/submit`)
        .send(submissionData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Exam submitted successfully');
    });

    test('should fail with invalid exam ID', async () => {
      const response = await studentAgent
        .post('/api/student/exams/invalid/submit')
        .send({ answers: [] })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should fail when missing answers', async () => {
      const response = await studentAgent
        .post('/api/student/exams/1/submit')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/student/statistics', () => {
    test('should get student statistics', async () => {
      const response = await studentAgent
        .get('/api/student/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toHaveProperty('totalCourses');
      expect(response.body.statistics).toHaveProperty('averageGrade');
      expect(response.body.statistics).toHaveProperty('completedExams');
      expect(response.body.statistics).toHaveProperty('upcomingExams');
    });

    test('should fail for non-student users', async () => {
      await teacherAgent
        .get('/api/student/statistics')
        .expect(403);
    });
  });
});