const request = require('supertest');
const app = require('../../src/app'); // Assuming app export
const sequelize = require('../../src/config/db/index');

// Test suite for Authentication API endpoints
describe('Authentication API Tests', () => {
  let server;
  let agent;

  beforeAll(async () => {
    // Setup test database
    await sequelize.sync({ force: true });
    server = app.listen(0); // Use random port for testing
    agent = request.agent(server);
  });

  afterAll(async () => {
    await sequelize.close();
    server.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await sequelize.sync({ force: true });
  });

  describe('POST /api/auth/register', () => {
    test('should register a new student successfully', async () => {
      const userData = {
        username: 'teststudent',
        email: 'student@test.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'Student',
        user_type: 'student'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'teststudent');
      expect(response.body.user).toHaveProperty('user_type', 'student');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should register a new teacher successfully', async () => {
      const userData = {
        username: 'testteacher',
        email: 'teacher@test.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'Teacher',
        user_type: 'teacher',
        department: 'Computer Science'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('user_type', 'teacher');
      expect(response.body.user).toHaveProperty('department', 'Computer Science');
    });

    test('should fail with duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        email: 'user1@test.com',
        password: 'password123',
        first_name: 'User',
        last_name: 'One',
        user_type: 'student'
      };

      // Create first user
      await agent.post('/api/auth/register').send(userData);

      // Try to create duplicate
      const duplicateData = { ...userData, email: 'user2@test.com' };
      const response = await agent
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        user_type: 'student'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should fail with missing required fields', async () => {
      const userData = {
        username: 'testuser',
        // Missing email, password, etc.
        user_type: 'student'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user before each login test
      await agent.post('/api/auth/register').send({
        username: 'logintest',
        email: 'login@test.com',
        password: 'password123',
        first_name: 'Login',
        last_name: 'Test',
        user_type: 'student'
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        username: 'logintest',
        password: 'password123'
      };

      const response = await agent
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'logintest');
    });

    test('should fail with invalid password', async () => {
      const loginData = {
        username: 'logintest',
        password: 'wrongpassword'
      };

      const response = await agent
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should fail with non-existent username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await agent
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should fail with missing credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authAgent;

    beforeEach(async () => {
      // Create and login user
      await agent.post('/api/auth/register').send({
        username: 'profiletest',
        email: 'profile@test.com',
        password: 'password123',
        first_name: 'Profile',
        last_name: 'Test',
        user_type: 'student'
      });

      authAgent = request.agent(server);
      await authAgent.post('/api/auth/login').send({
        username: 'profiletest',
        password: 'password123'
      });
    });

    test('should get user profile when authenticated', async () => {
      const response = await authAgent
        .get('/api/auth/profile')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'profiletest');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should fail when not authenticated', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authAgent;

    beforeEach(async () => {
      // Create and login user
      await agent.post('/api/auth/register').send({
        username: 'logouttest',
        email: 'logout@test.com',
        password: 'password123',
        first_name: 'Logout',
        last_name: 'Test',
        user_type: 'student'
      });

      authAgent = request.agent(server);
      await authAgent.post('/api/auth/login').send({
        username: 'logouttest',
        password: 'password123'
      });
    });

    test('should logout successfully', async () => {
      const response = await authAgent
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify session is cleared by trying to access profile
      await authAgent
        .get('/api/auth/profile')
        .expect(401);
    });

    test('should handle logout when not authenticated', async () => {
      const response = await request(server)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let authAgent;

    beforeEach(async () => {
      // Create and login user
      await agent.post('/api/auth/register').send({
        username: 'updatetest',
        email: 'update@test.com',
        password: 'password123',
        first_name: 'Update',
        last_name: 'Test',
        user_type: 'student'
      });

      authAgent = request.agent(server);
      await authAgent.post('/api/auth/login').send({
        username: 'updatetest',
        password: 'password123'
      });
    });

    test('should update profile successfully', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        email: 'updated@test.com'
      };

      const response = await authAgent
        .put('/api/auth/profile')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('first_name', 'Updated');
      expect(response.body.user).toHaveProperty('last_name', 'Name');
      expect(response.body.user).toHaveProperty('email', 'updated@test.com');
    });

    test('should fail when not authenticated', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name'
      };

      const response = await request(server)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should validate email format', async () => {
      const updateData = {
        email: 'invalid-email-format'
      };

      const response = await authAgent
        .put('/api/auth/profile')
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});