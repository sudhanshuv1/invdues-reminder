// tests/jest.backend.config.js
module.exports = {
  displayName: 'Backend',
  testEnvironment: 'node',
  rootDir: '../',
  testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/backend/setup.js'],
  collectCoverageFrom: [
    'backend/controllers/**/*.js',
    'backend/utils/**/*.js',
    'backend/models/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: '<rootDir>/tests/coverage/backend',
  verbose: true,
  testTimeout: 30000
};