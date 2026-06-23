/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/services/**/*.ts', 'src/lib/**/*.ts'],
  coverageThreshold: {
    'src/lib/**/*.ts': { lines: 80 },
    'src/services/receipt-parser.ts': { lines: 100, functions: 100 },
    'src/services/category-rules.ts': { lines: 100, functions: 100 },
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|drizzle-orm|@react-native-ml-kit/.*))',
  ],
};
