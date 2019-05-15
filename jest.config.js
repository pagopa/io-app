const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  transform: {
    ...tsjPreset.transform,
    //'\\.js$': 'ts-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|react-navigation|@react-navigation|react-navigation-redux-helpers|react-native-device-info|native-base|native-base-shoutem-theme|@shoutem/animation|@shoutem/ui|rn-placeholder)"
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
