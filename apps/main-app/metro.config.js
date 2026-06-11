/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/immutable-data */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');
const { getRewriteRequestUrl } = require('@expo/metro-config/build/rewriteRequestUrl');

const projectRoot = path.resolve(__dirname);

const defaultConfig = getDefaultConfig(projectRoot);
const { resolver: { sourceExts, assetExts } } = defaultConfig;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * In a monorepo Expo auto-detects the workspace root and sets
 * `server.unstable_serverRoot` to it. Metro then uses that root to compute
 * relative asset paths during release builds (`saveAssets`), while the
 * transform worker uses `projectRoot`.  The mismatch causes assets to be
 * saved under `assets/apps/main-app/img/…` but referenced in the JS bundle
 * as `assets/img/…`, so PNGs are missing at runtime.
 *
 * Pinning `unstable_serverRoot` to `projectRoot` fixes the asset-path
 * alignment, but we must also regenerate `rewriteRequestUrl` so the
 * virtual-entry redirect (`/.expo/.virtual-metro-entry.bundle`) resolves
 * the entry file relative to the same root.  Setting
 * `EXPO_NO_METRO_WORKSPACE_ROOT` before calling `getRewriteRequestUrl`
 * makes Expo treat projectRoot as serverRoot inside the rewrite function.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Force Expo's rewriteRequestUrl to use projectRoot (not workspace root)
// so that the virtual-entry redirect produces a path Metro can resolve.
process.env.EXPO_NO_METRO_WORKSPACE_ROOT = '1';

const config = {
  projectRoot,
  server: {
    unstable_serverRoot: projectRoot,
    rewriteRequestUrl: getRewriteRequestUrl(projectRoot)
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

module.exports = mergeConfig(defaultConfig, config);
