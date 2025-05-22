// Jest setup file
import "@testing-library/jest-dom";

// Mock environment variables
process.env.WORDPRESS_URL = "https://brownpoliticalreview.org/";

// Mock console.error to keep test output clean
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
