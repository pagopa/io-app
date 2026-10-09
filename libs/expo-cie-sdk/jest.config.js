module.exports = {
  displayName: "expo-cie-sdk",
  preset: "react-native",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  transform: {
    "\\.[jt]sx?$": [
      "babel-jest",
      { configFile: "../../apps/main-app/babel.config.js" }
    ]
  },
  coverageDirectory: "../../coverage/libs/expo-cie-sdk"
};
