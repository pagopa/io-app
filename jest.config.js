const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  transform: {
    ...tsjPreset.transform,
    '\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|native-base|native-base-shoutem-theme|@shoutem/animation|@shoutem/ui)"
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
    }
  },
  setupFiles: [
    "./jestSetup.js"
  ],
  collectCoverage: true
};
