module.exports = {
  plugins: [
    "macros",
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"]
      }
    ],
    [
           'module-resolver',
           {
             alias: {
               'crypto': 'react-native-quick-crypto',
               'stream': 'stream-browserify',
               'buffer': '@craftzdog/react-native-buffer',
             },
           },
         ]
  ],
  presets: ["module:metro-react-native-babel-preset"]
};
