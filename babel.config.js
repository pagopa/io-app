module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "macros",
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"],
      },
    ],
    [
      "@babel/plugin-transform-class-properties",
      { loose: true },
    ],
    [
      "@babel/plugin-transform-private-methods",
      { loose: true },
    ],
    [
      "@babel/plugin-transform-private-property-in-object",
      { loose: true },
    ],
  ],
};
