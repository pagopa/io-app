module.exports = {
  plugins: [
    "macros",
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"]
      }
    ]
  ],
  presets: ["module:@react-native/babel-preset"]
};
