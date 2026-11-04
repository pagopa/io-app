import { ImageStyle, PlatformOSType, ViewStyle } from "react-native";

/** Gradient drawn as the background of a credential card or of its badge */
export type CardGradient = GradientColors &
  (
    | {
        /** Center as fractions of the card width and height */
        center: readonly [number, number];
        /** Radius as a fraction of the card width */
        radius: number;
        type: "radial";
      }
    | {
        /** CSS angle in degrees: 0 goes bottom to top, 90 left to right */
        angle: number;
        type: "linear";
      }
  );

type BackgroundImage = NonNullable<ViewStyle["experimental_backgroundImage"]>;

type GradientColors = {
  colors: ReadonlyArray<string>;
  positions?: ReadonlyArray<number>;
};

/** Width / height ratio of every credential card. */
export const CREDENTIAL_CARD_ASPECT_RATIO = 16 / 10;

/** First Android API level (Android 10) that applies `mixBlendMode`. */
const MIX_BLEND_MODE_MIN_ANDROID_API_LEVEL = 29;

/** Pattern overlay images ship at @1x, @2x and @3x. */
const PATTERN_ASSET_SCALES = [1, 2, 3];

/** Density in dpi of an Android @1x (mdpi) resource. */
const ANDROID_BASELINE_DENSITY = 160;

/**
 * First Android API level (Android 13) that loads the next denser resource
 * variant, the same one React Native picks for the asset scale.
 */
const NEXT_DENSER_RESOURCE_MIN_ANDROID_API_LEVEL = 33;

const toPercentage = (value: number) => `${+(value * 100).toFixed(3)}%`;

/**
 * Explicit position of each color stop. Positions are pinned to the [previous
 * stop, 1] range, the same way Skia renders them.
 */
const getColorStopPositions = ({
  colors,
  positions
}: GradientColors): Array<number> =>
  colors.reduce<Array<number>>((acc, _, index) => {
    const position =
      positions?.[index] ??
      (colors.length > 1 ? index / (colors.length - 1) : 0);
    const previous = acc[index - 1] ?? 0;
    return [...acc, Math.max(previous, Math.min(1, position))];
  }, []);

/**
 * Converts a card gradient into the native `experimental_backgroundImage`
 * value.
 */
export const getCardBackgroundImage = (
  gradient: CardGradient
): BackgroundImage => {
  const positions = getColorStopPositions(gradient);

  if (gradient.type === "radial") {
    const [x, y] = gradient.center;
    const stops = gradient.colors
      .map((color, index) => `${color} ${toPercentage(positions[index])}`)
      .join(", ");
    // The radius is relative to the card width: on a 16:10 card an ellipse
    // with these radii is the circle the config describes
    return `radial-gradient(ellipse ${toPercentage(gradient.radius)} ${toPercentage(
      gradient.radius * CREDENTIAL_CARD_ASPECT_RATIO
    )} at ${toPercentage(x)} ${toPercentage(y)}, ${stops})`;
  }

  return [
    {
      type: "linear-gradient",
      direction: `${gradient.angle}deg`,
      colorStops: gradient.colors.map((color, index) => ({
        color,
        positions: [toPercentage(positions[index])]
      }))
    }
  ];
};

/** Whether native views can draw `mixBlendMode`: Android ignores it before API 29. */
export const supportsMixBlendMode = (
  os: PlatformOSType,
  version: number | string
) =>
  os !== "android" || Number(version) >= MIX_BLEND_MODE_MIN_ANDROID_API_LEVEL;

/**
 * Whether Android before 13 prefers `density` over `otherDensity` for the
 * `requested` screen density: it scales down a denser resource unless a sparser
 * one is close enough (ResTable_config::isBetterThan in AOSP).
 */
const isBetterLegacyAndroidDensity = (
  density: number,
  otherDensity: number,
  requested: number
) => {
  const [low, high] =
    density < otherDensity ? [density, otherDensity] : [otherDensity, density];
  const isHigher = density === high;
  if (requested >= high) {
    return isHigher;
  }
  if (low >= requested) {
    return !isHigher;
  }
  return (2 * low - requested) * high > requested * requested
    ? !isHigher
    : isHigher;
};

/**
 * Scale of the pattern bitmap that Android decodes. Assets served by the dev
 * server, and resources on Android 13+, use the scale React Native reports;
 * older Android versions pick the resource variant with their own rule.
 */
export const getDecodedAndroidAssetScale = (
  version: number | string,
  pixelRatio: number,
  asset: { scale: number; uri: string }
) =>
  asset.uri.startsWith("http") ||
  Number(version) >= NEXT_DENSER_RESOURCE_MIN_ANDROID_API_LEVEL
    ? asset.scale
    : PATTERN_ASSET_SCALES.reduce((best, scale) =>
        isBetterLegacyAndroidDensity(
          scale * ANDROID_BASELINE_DENSITY,
          best * ANDROID_BASELINE_DENSITY,
          pixelRatio * ANDROID_BASELINE_DENSITY
        )
          ? scale
          : best
      );

/**
 * Style of a repeated pattern image. Android repeats the decoded bitmap at its
 * pixel size: scaling it by `pixelRatio / decodedAssetScale` brings the tiles
 * back to their density-independent size, as on iOS.
 */
export const getPatternTileStyle = (
  os: PlatformOSType,
  pixelRatio: number,
  decodedAssetScale: number
): ImageStyle => {
  const scale = os === "android" ? pixelRatio / decodedAssetScale : 1;
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: `${100 / scale}%`,
    height: `${100 / scale}%`,
    transformOrigin: "top left",
    transform: [{ scale }]
  };
};
