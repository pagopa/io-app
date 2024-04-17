module.exports = {
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|rn-placeholder|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@react-native-community/push-notification-ios|@react-native-camera-roll/camera-roll|@codler|remark|unified|bail|is-plain-obj|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|parse-entities|character-entities|mdast-util-to-markdown|zwitch|longest-streak|@pagopa/io-react-native-zendesk|rn-qr-generator|mixpanel-react-native)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  setupFiles: [
    "./jestSetup.js",
    "./node_modules/react-native-gesture-handler/jestSetup.js"
  ],
  globalSetup: "./jestGlobalSetup.js",
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "./jestSetupAfterEnv.js"
  ],
  collectCoverage: true,
  testPathIgnorePatterns: [".*fiscal-code.test.ts$"]
};
