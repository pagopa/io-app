module.exports = {
  displayName: "@io-app/expo-crypto",
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["babel-jest", { presets: ["@react-native/babel-preset"] }]
  }
};
