const { getDefaultConfig } = require("metro-config");

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
      sourceExts: [...withE2ESourceExts, "svg"]
    }
  };
})();
