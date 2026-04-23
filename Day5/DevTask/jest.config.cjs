module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.cjs"],
  testMatch: ["<rootDir>/tests/**/*.test.cjs"],
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

