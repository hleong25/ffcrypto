module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  setupFiles: [
    './src/inversify.config.ts',
    // 'jest-localstorage-mock',
    './src/persist/__mocks__/localStorageMock.js'
  ]
};