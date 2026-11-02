module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    ["@babel/plugin-transform-private-methods", { loose: true }],
    ["@babel/plugin-transform-class-properties", { loose: true }],
    ["@babel/plugin-transform-private-property-in-object", { loose: true }],
    "react-native-worklets/plugin"
  ]
};
