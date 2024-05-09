/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/immutable-data */
const { getDefaultConfig } = require("metro-config");
const {
  createSentryMetroSerializer
} = require("@sentry/react-native/dist/js/tools/sentryMetroSerializer");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  const withE2ESourceExts = process.env.RN_SRC_EXT
    ? process.env.RN_SRC_EXT.split(",").concat(sourceExts)
    : sourceExts;
  return {
    serializer: {
      customSerializer: createSentryMetroSerializer()
    },
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
