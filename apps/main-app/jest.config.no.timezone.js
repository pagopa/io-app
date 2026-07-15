module.exports = {
  preset: "react-native",
  // Cap concurrency and recycle workers to keep RAM bounded.
  maxWorkers: "50%",
  // Above the per-worker baseline so only bloated workers recycle.
  workerIdleMemoryLimit: "2.5GB",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@shopify/react-native-skia|lottie-react-native|@codler|remark|unified|bail|is-plain-obj|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|parse-entities|character-entities|mdast-util-to-markdown|zwitch|longest-streak|@pagopa/io-react-native-zendesk|rn-qr-generator|mixpanel-react-native|@io-app/design-system|uuid|@pagopa/io-react-native-cie)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  setupFiles: [
    "./jestSetup.js",
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "./node_modules/@shopify/react-native-skia/jestSetup.js"
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverage: true
};
