module.exports = {
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@react-native-community/push-notification-ios|@shopify/react-native-skia|lottie-react-native|@codler|remark|unified|bail|is-plain-obj|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|parse-entities|character-entities|mdast-util-to-markdown|zwitch|longest-streak|@pagopa/io-react-native-zendesk|rn-qr-generator|mixpanel-react-native|@pagopa/io-app-design-system|uuid|@sentry/react-native|decode-named-character-reference|mdast-util-phrasing|unist-util-is|@pagopa/io-react-native-wallet|@pagopa/io-react-native-cie|@shopify/flash-list)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  setupFiles: [
    "./jestSetup.js",
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "./node_modules/@shopify/react-native-skia/jestSetup.js"
  ],
  globalSetup: "./jestGlobalSetup.js",
  setupFilesAfterEnv: ["./jestAfterEnvSetup.js"],
  collectCoverage: true,
  testPathIgnorePatterns: [".*fiscal-code.test.ts$"]
};
