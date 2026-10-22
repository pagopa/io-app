import { IOColors } from "@io-app/design-system";
import { memo } from "react";
import {
  Image,
  ImageRequireSource,
  PixelRatio,
  Platform,
  StyleSheet,
  View
} from "react-native";

import { CredentialType } from "../../utils/itwMocksUtils";
import {
  CREDENTIAL_CARD_ASPECT_RATIO,
  getCardBackgroundImage,
  getDecodedAndroidAssetScale,
  getPatternTileStyle,
  supportsMixBlendMode
} from "./backgroundUtils";
import { CREDENTIAL_CARD_CORNER_OVERLAY, CredentialCardConfig } from "./config";
import { SkiaCardBackground } from "./SkiaCardBackground";
import { CardColorScheme } from "./types";

const canBlendNatively = () =>
  supportsMixBlendMode(Platform.OS, Platform.Version);

const getPatternStyle = (source: ImageRequireSource) => {
  const pixelRatio = PixelRatio.get();
  const { uri = "", scale = 1 } = Image.resolveAssetSource(source) ?? {};
  const decodedAssetScale =
    Platform.OS === "android"
      ? getDecodedAndroidAssetScale(Platform.Version, pixelRatio, {
          scale,
          uri
        })
      : scale;
  return getPatternTileStyle(Platform.OS, pixelRatio, decodedAssetScale);
};

type Props = Pick<CredentialCardConfig, "background" | "color" | "overlay">;

/**
 * Credential card background drawn with native views: a gradient, an optional
 * tinted corner, an optional soft-light pattern and an optional artwork.
 */
export const CardBackground = memo(({ background, color, overlay }: Props) => {
  if (overlay?.pattern !== undefined && !canBlendNatively()) {
    return (
      <SkiaCardBackground
        background={background}
        color={color}
        pattern={overlay.pattern}
        showCornerOverlay={overlay.showCornerOverlay}
      />
    );
  }

  const hasBlend = overlay?.pattern !== undefined;

  return (
    <View
      pointerEvents="none"
      // Caches the soft-light blend in a texture, so it is not recomputed on
      // every frame and it fades as a whole with the card
      renderToHardwareTextureAndroid={hasBlend}
      shouldRasterizeIOS={hasBlend}
      style={[
        styles.fill,
        styles.base,
        { experimental_backgroundImage: getCardBackgroundImage(background) }
      ]}
      testID="itwCredentialCardBackgroundTestID"
    >
      {overlay?.showCornerOverlay && (
        <Image
          accessibilityIgnoresInvertColors
          fadeDuration={0}
          resizeMode="stretch"
          source={CREDENTIAL_CARD_CORNER_OVERLAY}
          style={styles.fill}
          tintColor={color}
        />
      )}
      {overlay?.pattern !== undefined && (
        <View style={[styles.fill, styles.softLight]}>
          <Image
            accessibilityIgnoresInvertColors
            fadeDuration={0}
            resizeMode="repeat"
            source={overlay.pattern}
            style={getPatternStyle(overlay.pattern)}
            testID="itwCredentialCardPatternTestID"
          />
        </View>
      )}
      {overlay?.card !== undefined && (
        <Image
          accessibilityIgnoresInvertColors
          fadeDuration={0}
          resizeMode="cover"
          source={overlay.card}
          style={styles.fill}
          testID="itwCredentialCardArtworkTestID"
        />
      )}
    </View>
  );
});

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
const legacyCredentialCardBackgrounds: { [type: string]: ImageRequireSource } =
  {
    [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
    [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
    [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
  };

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
const legacyCredentialGradientColors: { [type: string]: Array<string> } = {
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"],
  [CredentialType.EDUCATION_DIPLOMA]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ATTENDANCE]: ["#F2F1CE", "#ECECEC"]
};

const LEGACY_DEFAULT_GRADIENT_COLORS = [
  IOColors["grey-100"],
  IOColors["grey-200"]
];

/** CSS angle of the gradient line from the top-left to the bottom-right corner */
const LEGACY_GRADIENT_ANGLE =
  180 - (Math.atan(CREDENTIAL_CARD_ASPECT_RATIO) * 180) / Math.PI;
const LEGACY_GRADIENT_BORDER_RADIUS = 16;
/** Opacity of the artwork of a credential that is not valid */
const LEGACY_FADED_OPACITY = 0.4;

type LegacyProps = {
  colorScheme: CardColorScheme;
  credentialType: string;
};

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
export const LegacyCardBackground = memo(
  ({ credentialType, colorScheme }: LegacyProps) => {
    const image = legacyCredentialCardBackgrounds[credentialType];

    if (image === undefined) {
      const [from, to] =
        legacyCredentialGradientColors[credentialType] ??
        LEGACY_DEFAULT_GRADIENT_COLORS;
      return (
        <View style={[styles.fill, styles.legacyGradientContainer]}>
          <View
            style={[
              styles.fill,
              styles.legacyGradient,
              {
                experimental_backgroundImage: getCardBackgroundImage({
                  type: "linear",
                  angle: LEGACY_GRADIENT_ANGLE,
                  colors: [from, to]
                })
              }
            ]}
          />
        </View>
      );
    }

    const isGreyscale = colorScheme === "greyscale";
    const blendsGreyscale = isGreyscale && canBlendNatively();

    return (
      <View
        // Keeps the greyscale blend correct while the card fades
        renderToHardwareTextureAndroid={blendsGreyscale}
        shouldRasterizeIOS={blendsGreyscale}
        style={[styles.fill, styles.base]}
      >
        <View
          style={[
            styles.fill,
            colorScheme !== "default" && styles.legacyFaded,
            isGreyscale && !blendsGreyscale && styles.legacyGrayscaleFilter
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            fadeDuration={0}
            resizeMode="stretch"
            source={image}
            style={styles.fill}
          />
        </View>
        {blendsGreyscale && (
          <View style={[styles.fill, styles.legacyGrayscaleBlend]} />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  // Images from require() get the asset size, which would win over absoluteFill
  fill: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%"
  },
  base: {
    backgroundColor: IOColors.white
  },
  softLight: {
    mixBlendMode: "soft-light"
  },
  legacyGradientContainer: {
    backgroundColor: IOColors["grey-100"]
  },
  legacyGradient: {
    borderRadius: LEGACY_GRADIENT_BORDER_RADIUS,
    overflow: "hidden"
  },
  legacyFaded: {
    opacity: LEGACY_FADED_OPACITY
  },
  legacyGrayscaleBlend: {
    backgroundColor: IOColors.white,
    mixBlendMode: "color"
  },
  legacyGrayscaleFilter: {
    filter: [{ grayscale: 1 }]
  }
});
