module.exports = {
  displayName: "@io-app/expo-http-client",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["babel-jest", { presets: ["babel-preset-expo"] }]
  }
};
