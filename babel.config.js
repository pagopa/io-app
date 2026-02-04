/* eslint-disable functional/immutable-data */
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "macros",
    [
      "@babel/plugin-transform-class-properties",
      { loose: true }
    ],
    [
      "@babel/plugin-transform-private-methods",
      { loose: true }
    ],
    [
      "@babel/plugin-transform-private-property-in-object",
      { loose: true }
    ],
    [
      "react-native-worklets/plugin",
      {
        globals: ["__scanCodes"]
      }
    ]
  ]
};
