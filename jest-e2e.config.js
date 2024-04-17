module.exports = {
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|rn-placeholder|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@react-native-community/push-notification-ios|@react-native-camera-roll/camera-roll|@codler|mixpanel-react-native)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  setupFilesAfterEnv: ["./e2e/globalSetup.js"],
  testMatch: ["**/__e2e__/*.e2e.ts?(x)"],
  forceExit: true,
  verbose: true,
  maxWorkers: 1,
  testTimeout: 300000,
  testEnvironment: "./e2e/environment",
  testRunner: "jest-circus/runner",
  reporters: ["detox/runners/jest/streamlineReporter"]
};
