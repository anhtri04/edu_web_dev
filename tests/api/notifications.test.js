const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/db/index');

// Test suite for Notification API endpoints
describe('Notification API Tests', () => {
  let server;
  let agent;
  let studentAgent;
  let teacherAgent;
  let adminAgent;

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

    // Create users
    await agent.post('/api/auth/register').send({
      username: 'teststudent',
      email: 'student@test.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Student',
      user_type: 'student'
    });

    await agent.post('/api/auth/register').send({
      username: 'testteacher',
      email: 'teacher@test.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Teacher',
      user_type: 'teacher'
    });

    await agent.post('/api/auth/register').send({
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Admin',
      user_type: 'admin'
    });

    // Login agents
    studentAgent = request.agent(server);
    await studentAgent.post('/api/auth/login').send({
      username: 'teststudent',
      password: 'password123'
    });

    teacherAgent = request.agent(server);
    await teacherAgent.post('/api/auth/login').send({
      username: 'testteacher',
      password: 'password123'
    });

    adminAgent = request.agent(server);
    await adminAgent.post('/api/auth/login').send({
      username: 'testadmin',
      password: 'password123'
    });
  });

  describe('GET /api/notifications', () => {
    test('should get user notifications', async () => {
      const response = await studentAgent
        .get('/api/notifications')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    test('should filter unread notifications', async () => {
      const response = await studentAgent
        .get('/api/notifications?filter=unread')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('notifications');
    });

    test('should paginate notifications', async () => {
      const response = await studentAgent
        .get('/api/notifications?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    test('should fail when not authenticated', async () => {
      await request(server)
        .get('/api/notifications')
        .expect(401);
    });
  });

  describe('POST /api/notifications', () => {
    test('should create notification as admin', async () => {
      const notificationData = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'announcement',
        target_users: ['student'],
        is_global: true
      };

      const response = await adminAgent
        .post('/api/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('notification');
      expect(response.body.notification).toHaveProperty('title', 'Test Notification');
    });

    test('should create notification as teacher', async () => {
      const notificationData = {
        title: 'Class Update',
        message: 'Class schedule has been updated',
        type: 'class_update',
        target_users: ['student'],
        class_id: 1
      };

      const response = await teacherAgent
        .post('/api/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should fail when student tries to create notification', async () => {
      const notificationData = {
        title: 'Test',
        message: 'Test message',
        type: 'announcement'
      };

      await studentAgent
        .post('/api/notifications')
        .send(notificationData)
        .expect(403);
    });

    test('should fail with missing required fields', async () => {
      const notificationData = {
        title: 'Test'
        // Missing message and type
      };

      await adminAgent
        .post('/api/notifications')
        .send(notificationData)
        .expect(400);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    test('should mark notification as read', async () => {
      const notificationId = 1;
      
      const response = await studentAgent
        .put(`/api/notifications/${notificationId}/read`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Notification marked as read');
    });

    test('should fail with invalid notification ID', async () => {
      await studentAgent
        .put('/api/notifications/invalid/read')
        .expect(400);
    });

    test('should fail when notification does not exist', async () => {
      await studentAgent
        .put('/api/notifications/99999/read')
        .expect(404);
    });
  });

  describe('PUT /api/notifications/mark-all-read', () => {
    test('should mark all notifications as read', async () => {
      const response = await studentAgent
        .put('/api/notifications/mark-all-read')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'All notifications marked as read');
    });

    test('should fail when not authenticated', async () => {
      await request(server)
        .put('/api/notifications/mark-all-read')
        .expect(401);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    test('should delete notification as admin', async () => {
      const notificationId = 1;
      
      const response = await adminAgent
        .delete(`/api/notifications/${notificationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Notification deleted successfully');
    });

    test('should fail when student tries to delete notification', async () => {
      await studentAgent
        .delete('/api/notifications/1')
        .expect(403);
    });

    test('should fail with non-existent notification', async () => {
      await adminAgent
        .delete('/api/notifications/99999')
        .expect(404);
    });
  });

  describe('GET /api/notifications/count', () => {
    test('should get notification count', async () => {
      const response = await studentAgent
        .get('/api/notifications/count')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toHaveProperty('total');
      expect(response.body.count).toHaveProperty('unread');
    });

    test('should fail when not authenticated', async () => {
      await request(server)
        .get('/api/notifications/count')
        .expect(401);
    });
  });
});