/* eslint-disable functional/immutable-data */
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        extensions: [".tsx", ".ts", ".js", ".json"],
        alias: {
          crypto: "react-native-quick-crypto",
          stream: "readable-stream",
          buffer: "@craftzdog/react-native-buffer"
        }
      }
    ],
    "macros",
    ["@babel/plugin-transform-class-properties", { loose: true }],
    ["@babel/plugin-transform-private-methods", { loose: true }],
    ["@babel/plugin-transform-private-property-in-object", { loose: true }],
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"]
      }
    ]
  ]
};
