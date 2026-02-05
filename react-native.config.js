// "rnpm" is deprecated and support for it will be removed in next major version of the CLI.
// Migration guide https://github.com/react-native-community/cli/blob/master/docs/configuration.md
const shouldExcludeInternalModule = process.env.NO_INTERNAL_MODULE === '1';

// eslint-disable-next-line functional/immutable-data
module.exports = {
  dependencies: {
    "@pagopa/react-native-cie": {
      platforms: {
        android: null, // disable Android platform, other platforms will still autolink if provided
        ios: shouldExcludeInternalModule ? null : {}
      }
    }
  },
  assets: [
    "./assets/fonts/TitilliumSansPro",
    "./assets/fonts/Titillio",
    "./assets/fonts/FiraCode"
  ]
};
