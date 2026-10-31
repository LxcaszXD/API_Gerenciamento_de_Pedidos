module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageThreshold: { global: { statements: 95, branches: 90, functions: 95, lines: 95 } },
};
