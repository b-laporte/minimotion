module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["<rootDir>/src/core/**/*.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json"
    }
  }
};
