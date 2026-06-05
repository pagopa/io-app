/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/immutable-data */
const { getDefaultConfig } = require('@expo/metro-config');
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
  server: {
    // @expo/metro-config sets unstable_serverRoot to the monorepo root to
    // support web, but Metro uses it to resolve the native entry point path.
    // Override it back to the app root so that `index.bundle` resolves to
    // apps/main-app/index.js instead of <monorepo-root>/index.js (which does
    // not exist), which would cause "unable to resolve ./index" at runtime.
    unstable_serverRoot: __dirname
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