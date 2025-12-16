/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/immutable-data */
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const {
  createSentryMetroSerializer
} = require("@sentry/react-native/dist/js/tools/sentryMetroSerializer");

const {
  resolver: { sourceExts, assetExts }
} = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  serializer: {
    customSerializer: createSentryMetroSerializer()
  },
  transformer: {
    babelTransformerPath: require.resolve(
      "react-native-svg-transformer/react-native"
    )
  },
  resolver: {
    sourceExts: [...sourceExts, "svg"],
    assetExts: assetExts.filter(ext => ext !== "svg")
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
