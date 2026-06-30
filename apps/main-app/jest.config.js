module.exports = {
  preset: "react-native",
  // Cap concurrency and recycle workers to keep RAM bounded.
  maxWorkers: "50%",
  // Above the per-worker baseline so only bloated workers recycle.
  workerIdleMemoryLimit: "2.5GB",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
    "\\.mjs$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@shopify/react-native-skia|lottie-react-native|@codler|remark|unified|bail|is-plain-obj|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|parse-entities|character-entities|mdast-util-to-markdown|zwitch|longest-streak|@pagopa/io-react-native-zendesk|rn-qr-generator|mixpanel-react-native|@pagopa/io-app-design-system|uuid|decode-named-character-reference|mdast-util-phrasing|unist-util-is|@pagopa/io-react-native-wallet|@pagopa/io-react-native-cie|@shopify/flash-list|@pagopa/io-react-native-login-utils|@pagopa/io-react-native-http-client|@pagopa/io-react-native-iso18013|@openid4vc|dcql|@swmansion/react-native-bottom-sheet)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  setupFiles: [
    "./jestSetup.js",
    "../../node_modules/react-native-gesture-handler/jestSetup.js",
    "../../node_modules/@shopify/react-native-skia/jestSetup.js"
  ],
  globalSetup: "./jestGlobalSetup.js",
  setupFilesAfterEnv: ["./jestAfterEnvSetup.js"],
  collectCoverage: true,
  coverageReporters: ["lcov", "text"],
  coveragePathIgnorePatterns: [
    "<rootDir>/ts/@types/",
    "<rootDir>/ts/features/design-system/",
    "<rootDir>/ts/features/.*/playgrounds/",
    "<rootDir>/ts/features/settings/devMode/"
  ],
  testPathIgnorePatterns: [".*fiscal-code.test.ts$"]
};
