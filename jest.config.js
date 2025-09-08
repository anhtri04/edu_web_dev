const { execSync } = require('child_process');
const path = require('path');

// Test configuration for API tests
module.exports = {
  // Test environment setup
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/public/**',
    '!src/resources/**',
    '!**/node_modules/**'
  ],
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Global variables
  globals: {
    'NODE_ENV': 'test'
  },
  
  // Module paths
  modulePaths: ['<rootDir>/src'],
  
  // Transform files
  transform: {},
  
  // Test sequence
  runInBand: true, // Run tests serially to avoid database conflicts
  
  // Error handling
  errorOnDeprecated: true,
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ]
};