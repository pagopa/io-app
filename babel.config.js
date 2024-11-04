module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "macros",
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"]
      }
    ]
  ]
};
