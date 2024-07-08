const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const {
  resolver: { sourceExts, assetExts }
} = getDefaultConfig(__dirname);

const withE2ESourceExts = process.env.RN_SRC_EXT
  ? process.env.RN_SRC_EXT.split(",").concat(sourceExts)
  : sourceExts;

const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer")
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== "svg"),
    sourceExts: [...withE2ESourceExts, "svg"]
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
