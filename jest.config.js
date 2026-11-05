module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  setupFilesAfterEnv: ["<rootDir>/src/app/lib/__tests__/jest.setup.ts"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/app/lib/__tests__/styleMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
