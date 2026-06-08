/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/immutable-data */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

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
  // Explicitly pin the project root so Metro always resolves modules relative
  // to apps/main-app, regardless of the process working directory.
  projectRoot: path.resolve(__dirname),
  transformer: {
    babelTransformerPath:
      require.resolve("react-native-svg-transformer/react-native")
  },
  resolver: {
    sourceExts: [...sourceExts, "svg"],
    assetExts: assetExts.filter(ext => ext !== "svg"),

    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === "crypto") {
        return context.resolveRequest(
          context,
          "react-native-quick-crypto",
          platform
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    }
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
