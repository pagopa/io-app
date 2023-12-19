const { getDefaultConfig } = require("metro-config");
const OriginalResolver = require("metro-resolver");
const path = require("path");

const blacklistedModules = ["module"];

// eslint-disable-next-line functional/immutable-data
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  const withE2ESourceExts = process.env.RN_SRC_EXT
    ? process.env.RN_SRC_EXT.split(",").concat(sourceExts)
    : sourceExts;
  return {
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      experimentalImportSupport: false,
      inlineRequires: true
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== "svg"),
      sourceExts: [...withE2ESourceExts, "svg", "cjs"],
      extraNodeModules: {
        ...require("@pagopa/react-native-nodelibs")
      },
      resolveRequest: (context, moduleName, platform) => {
        if (blacklistedModules.includes(moduleName)) {
          return {
            filePath: path.resolve(__dirname + "/shim-module.js"),
            type: "sourceFile"
          };
        } else {
          return OriginalResolver.resolve(
            { ...context, resolveRequest: undefined },
            moduleName,
            platform
          );
        }
      }
    }
  };
})();
