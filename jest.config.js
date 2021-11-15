const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  ...tsjPreset,
  preset: "react-native",
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|native-base|native-base-shoutem-theme|@shoutem/animation|@shoutem/ui|rn-placeholder|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@react-native-community/push-notification-ios|@react-native-community/cameraroll|@codler|@react-native-community/datetimepicker|remark|unified|bail|is-plain-obj|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|parse-entities|character-entities|mdast-util-to-markdown|zwitch|longest-streak)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  globals: {
    "ts-jest": {
      babelConfig: true
    }
  },
  setupFiles: ["./jestSetup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverage: true
};
