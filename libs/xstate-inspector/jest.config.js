module.exports = {
  preset: "react-native",
  transform: {
    "\\.[jt]sx?$": "babel-jest"
  },
  // The preset's default list is anchored on `react-native/`, so the polyfill
  // (plain ESM) would not be transformed without an explicit entry.
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-url-polyfill)/)"
  ]
};
