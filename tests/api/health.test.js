const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/db/index');

// Test suite for Health Check API endpoints
describe('Health Check API Tests', () => {
  let server;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    server = app.listen(0);
  });

  afterAll(async () => {
    await sequelize.close();
    server.close();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('system');

      // Check memory structure
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('external');

      // Check system structure
      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('pid');

      // Validate data types
      expect(typeof response.body.uptime).toBe('number');
      expect(typeof response.body.memory.used).toBe('number');
      expect(typeof response.body.system.pid).toBe('number');
    });

    test('should return valid timestamp format', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should return environment information', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(['development', 'production', 'test']).toContain(response.body.environment);
    });
  });

  describe('GET /api/status', () => {
    test('should return system status', async () => {
      const response = await request(server)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('api', 'operational');
      expect(response.body).toHaveProperty('database', 'operational');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('metrics');

      // Check services structure
      expect(response.body.services).toHaveProperty('authentication', 'operational');
      expect(response.body.services).toHaveProperty('fileUpload', 'operational');
      expect(response.body.services).toHaveProperty('notifications', 'operational');
      expect(response.body.services).toHaveProperty('calendar', 'operational');

      // Check metrics structure
      expect(response.body.metrics).toHaveProperty('requestCount');
      expect(response.body.metrics).toHaveProperty('errorRate');
      expect(response.body.metrics).toHaveProperty('avgResponseTime');

      // Validate data types
      expect(typeof response.body.metrics.requestCount).toBe('number');
      expect(typeof response.body.metrics.errorRate).toBe('number');
      expect(typeof response.body.metrics.avgResponseTime).toBe('number');
    });

    test('should return valid service statuses', async () => {
      const response = await request(server)
        .get('/api/status')
        .expect(200);

      const validStatuses = ['operational', 'degraded', 'down'];
      expect(validStatuses).toContain(response.body.api);
      expect(validStatuses).toContain(response.body.database);
      expect(validStatuses).toContain(response.body.services.authentication);
      expect(validStatuses).toContain(response.body.services.fileUpload);
      expect(validStatuses).toContain(response.body.services.notifications);
      expect(validStatuses).toContain(response.body.services.calendar);
    });
  });

  describe('Health Check Integration', () => {
    test('should maintain consistent uptime across requests', async () => {
      const response1 = await request(server)
        .get('/api/health')
        .expect(200);

      // Wait a short time
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await request(server)
        .get('/api/health')
        .expect(200);

      // Second request should have higher or equal uptime
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });

    test('should handle concurrent health check requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(server).get('/api/health').expect(200)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
      });
    });

    test('should return reasonable memory usage values', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      // Memory values should be positive numbers
      expect(response.body.memory.used).toBeGreaterThan(0);
      expect(response.body.memory.total).toBeGreaterThan(0);
      expect(response.body.memory.external).toBeGreaterThanOrEqual(0);

      // Used memory should not exceed total memory
      expect(response.body.memory.used).toBeLessThanOrEqual(response.body.memory.total);
    });
  });
});