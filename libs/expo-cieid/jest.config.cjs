module.exports = {
  displayName: "expo-cieid",
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        babelrc: false,
        configFile: false,
        presets: ["module:@react-native/babel-preset"]
      }
    ]
  }
};
