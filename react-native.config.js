// "rnpm" is deprecated and support for it will be removed in next major version of the CLI.
// Migration guide https://github.com/react-native-community/cli/blob/master/docs/configuration.md

module.exports = {
  dependencies: {
    "@pagopa/react-native-cie": {
      platforms: {
        android: null // disable Android platform, other platforms will still autolink if provided
      }
    }
  },
  assets: [
    "./assets/fonts/TitilliumWeb",
    "./assets/fonts/ReadexPro",
    "./assets/fonts/io-icon-font",
    "./assets/fonts/Ionicons",
    "./assets/fonts/RobotoMono"
  ]
};
