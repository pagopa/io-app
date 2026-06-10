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
const projectRoot = path.resolve(__dirname);

const config = {
  projectRoot,
  // Align serverRoot with projectRoot so that Metro computes asset
  // httpServerLocation relative to apps/main-app (not the monorepo root).
  // Without this, Expo sets serverRoot to the workspace root which causes
  // asset paths in the JS bundle to diverge from where saveAssets copies
  // them during release builds, resulting in missing PNGs at runtime.
  server: {
    unstable_serverRoot: projectRoot
  },
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
