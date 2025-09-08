const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// System status endpoint (for admin monitoring)
router.get('/status', (req, res) => {
  try {
    const status = {
      api: 'operational',
      database: 'operational', // You might want to add actual DB connection check
      services: {
        authentication: 'operational',
        fileUpload: 'operational',
        notifications: 'operational',
        calendar: 'operational'
      },
      metrics: {
        requestCount: 0, // You might want to implement request counting
        errorRate: 0,
        avgResponseTime: 0
      }
    };

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Unable to retrieve system status',
      message: error.message
    });
  }
});

module.exports = router;