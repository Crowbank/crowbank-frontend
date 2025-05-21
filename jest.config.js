module.exports = {
  testEnvironment: 'jsdom', // Use jsdom for testing frontend code
  testMatch: ['**/tests/**/*.test.js'], // Match test files in the tests directory
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'], // Optional: for any setup needed
  moduleNameMapper: {
    // Update jQuery mock path
    '^jquery$': '<rootDir>/tests/mocks/jquery.js',
    // Update the page mock
    '^page$': '<rootDir>/tests/mocks/page.js',
  },
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!page|other-es-modules).+\\.js$'
  ],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', 'frontend'],
};
