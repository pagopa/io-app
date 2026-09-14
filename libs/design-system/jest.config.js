// eslint-disable-next-line functional/immutable-data
module.exports = {
  preset: "react-native",
  modulePathIgnorePatterns: [
    "<rootDir>/example/node_modules",
    "<rootDir>/lib/"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|native-base|native-base-shoutem-theme|@shoutem/animation|@shoutem/ui|rn-placeholder|jsbarcode|@pagopa/react-native-cie|react-native-share|jail-monkey|@react-native-community/art|@react-native-community/push-notification-ios|@react-native-community/cameraroll|@codler|@react-native-community/datetimepicker|remark|unified|bail|is-plain-obj|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|parse-entities|character-entities|mdast-util-to-markdown|zwitch|longest-streak|io-react-native-zendesk|rn-qr-generator)"
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/ts/__mocks__/svgMock.js"
  },
  setupFiles: ["./jestSetup.js"],
  collectCoverage: true
};
