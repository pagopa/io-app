module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|native-base|native-base-shoutem-theme|@shoutem/animation|@shoutem/ui|rn-placeholder|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@react-native-community/push-notification-ios|@react-native-community/cameraroll|@codler|@react-native-community/datetimepicker)"
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
