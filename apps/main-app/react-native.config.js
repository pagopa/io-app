// "rnpm" is deprecated and support for it will be removed in next major version of the CLI.
// Migration guide https://github.com/react-native-community/cli/blob/master/docs/configuration.md
// eslint-disable-next-line functional/immutable-data
module.exports = {
  dependencies: {
    // We can disable autolinking for art package since we don't use it.
    // It is installed as a dependency of react-native-barcode-builder which is patched to use svg instead of art.
    "@react-native-community/art": {
      platforms: {
        android: null,
        ios: null
      }
    }
  },
  assets: [
    "./assets/fonts/TitilliumSansPro",
    "./assets/fonts/Titillio",
    "./assets/fonts/FiraCode"
  ]
};
