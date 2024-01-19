module.exports = {
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "macros",
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"]
      }
    ]
  ],
  presets: ["module:metro-react-native-babel-preset"]
};
