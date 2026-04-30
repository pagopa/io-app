import { DataSourceParam } from "@shopify/react-native-skia";
import Color from "color";
import { ColorSchemeName } from "react-native";
import { fnv1a } from "../../../../../utils/hash";
import {
  CARD_CORNER_OVERLAY,
  CREDENTIAL_BASE_OVERLAYS,
  CREDENTIAL_CARD_OVERLAYS,
  CREDENTIAL_HEADER_OVERLAYS
} from "../../utils/assets";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItWalletThemes } from "../../utils/theme";
import { preloadImages } from "../../utils/imageCache";

export type CredentialCardBackground<L extends number = 1 | 2 | 3 | 4 | 5> = {
  /**
   * Up to 5 color stops, distributed evenly along the gradient line.
   * At least 2 colors are required for a meaningful gradient.
   */
  colors: [string, ...Array<string>] & { length: L };
  /**
   * Optional positions for each color stop, as values between 0 and 1.
   * When omitted the stops are distributed evenly (equivalent to CSS behaviour).
   * Must have the same length as `colors` when provided.
   */
  positions?: [number, ...Array<number>] & { length: L };
  /**
   * Angle in degrees following the CSS convention:
   * 0° = bottom → top, 90° = left → right, 135° = top-left → bottom-right.
   */
  angle?: number;
};

export type CredentialCardConfig = {
  /**
   * Base color for the credential, defined by the AS or in static configurations.
   */
  color: string;
  /**
   * Card background: either a solid colour or a gradient (angle + up to 5 stops).
   */
  background: CredentialCardBackground;
  /**
   * Color used for the credential title text.
   */
  titleColor: string;
  /**
   * Color used for the card border when the credential is valid.
   */
  borderColor: string;
  /**
   * Optional PNG image rendered as an overlay layer over the card.
   */
  overlay: DataSourceParam;
  /**
   * Optional PNG image rendered as an overlay layer in the credential detail
   * header.
   */
  headerOverlay?: DataSourceParam;
  /**
   * Wether to apply a blend mode to the overlay image (soft light)
   */
  overlayBlend?: boolean;
  /**
   * Whether to show the corner overlay with credential's base color
   */
  showCornerOverlay?: boolean;
};

/**
 * Colors from which random configurations will be generated, based on the
 * provided seed.
 */
const BASE_COLORS = ["#FFB357", "#CDD2FC", "#7AC1FA", "#003366"];

/**
 * Per-credential static card configuration.
 * Background, title color and border color are set explicitly here.
 * An optional `overlay` PNG image can be provided to render an overlay on top of the background.
 *
 * ADD MORE CONFIGURATIONS HERE IF NEEDED, ONLY FOR STATIC CREDENTIALS
 */
export const credentialCardConfigs: Partial<
  Record<string, CredentialCardConfig>
> = {
  [CredentialType.PID]: {
    color: "#EAF6FF",
    background: {
      colors: ["#EAF6FF", "#F6FBFF", "#EAF6FF", "#F9F9F9", "#EAF6FF"],
      positions: [0.0349, 0.2514, 0.4646, 0.7143, 0.9425],
      angle: 217
    },
    titleColor: "#115486",
    borderColor: "#4F99E2",
    overlay: CREDENTIAL_CARD_OVERLAYS[CredentialType.PID],
    headerOverlay: CREDENTIAL_HEADER_OVERLAYS[CredentialType.PID]
  },
  [CredentialType.DRIVING_LICENSE]: {
    color: "#FADCF5",
    background: {
      colors: ["#FADCF5", "#FFECFC", "#FADCF5", "#FFECFC"],
      positions: [0.0041, 0.3614, 0.6716, 1.0251],
      angle: 249
    },
    titleColor: "#652035",
    borderColor: "#D674A9",
    overlay: CREDENTIAL_CARD_OVERLAYS[CredentialType.DRIVING_LICENSE],
    headerOverlay: CREDENTIAL_HEADER_OVERLAYS[CredentialType.DRIVING_LICENSE]
  },
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
    color: "#B7E1FA",
    background: {
      colors: ["#B7E1FA", "#D0EDFF", "#B7E1FA", "#D0EDFF"],
      positions: [0.0031, 0.3686, 0.6772, 0.9904],
      angle: 249
    },
    titleColor: "#032D5C",
    borderColor: "#449DCF",
    overlay:
      CREDENTIAL_CARD_OVERLAYS[CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD],
    headerOverlay:
      CREDENTIAL_HEADER_OVERLAYS[CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]
  },
  [CredentialType.EUROPEAN_DISABILITY_CARD]: {
    color: "#D6EAF7",
    background: {
      colors: ["#D6EAF7"]
    },
    titleColor: "#17406F",
    borderColor: "#6B9BB6",
    overlay: CREDENTIAL_CARD_OVERLAYS[CredentialType.EUROPEAN_DISABILITY_CARD],
    headerOverlay:
      CREDENTIAL_HEADER_OVERLAYS[CredentialType.EUROPEAN_DISABILITY_CARD]
  },
  [CredentialType.AGE_VERIFICATION]: {
    color: "#CECFF2",
    background: {
      colors: ["#ECECEC", "#CECFF2"],
      angle: 180
    },
    titleColor: "#363740",
    borderColor: "#9490BE",
    overlay: CREDENTIAL_CARD_OVERLAYS[CredentialType.AGE_VERIFICATION],
    headerOverlay: CREDENTIAL_HEADER_OVERLAYS[CredentialType.AGE_VERIFICATION]
  }
};

/**
 * Generates a color based on credential type
 */
const generateBaseColorFromCredentialType = (
  credentialType: string
): string => {
  const colorHash = fnv1a(credentialType);
  return BASE_COLORS[colorHash % BASE_COLORS.length];
};

/**
 * Generates an overlay asset based on credential type
 */
const generateBaseOverlayFromCredentialType = (
  credentialType: string
): DataSourceParam => {
  const overlayHash = fnv1a(credentialType, 1);
  return CREDENTIAL_BASE_OVERLAYS[
    overlayHash % CREDENTIAL_BASE_OVERLAYS.length
  ];
};

/**
 * Generates a credential card configuration based on the provided base color and taxonomy.
 * @param credentialType The type of the credential
 * @param credentialColor Color assoaicted to the credential, if any. A color
 * will be generated based on the credential type if not provided.
 * @param colorScheme The current app color scheme (light, dark)
 *
 * @return A credential card configuration derived from the provided color
 *
 * TODO: [SIW-4216] Add credential's taxonomy as a parameter and use it to select the overlay pattern, instead of randomizing it
 */
const generateCredentialCardConfig = (
  credentialType: string,
  colorScheme: ColorSchemeName,
  credentialColor?: string
): CredentialCardConfig => {
  const theme = ItWalletThemes[colorScheme || "light"];
  const isLight = colorScheme !== "dark";

  const color =
    credentialColor || generateBaseColorFromCredentialType(credentialType);
  const baseColor = Color(color).hsv();

  const backgroundColor = Color.hsv(
    baseColor.hue(),
    ...(isLight ? [10, 100] : [95, 15])
  ).hex();

  const borderColor = Color.hsv(
    baseColor.hue(),
    ...(isLight ? [25, 60] : [10, 40])
  ).hex();

  const titleColor = Color.hsv(
    baseColor.hue(),
    ...(isLight ? [15, 20] : [10, 80])
  ).hex();

  // TODO: [SIW-4216] Use credential taxonomy info to select overlay pattern
  const overlay = generateBaseOverlayFromCredentialType(credentialType);

  return {
    color,
    background: {
      colors: [backgroundColor, theme["card-background"]]
    },
    borderColor,
    titleColor,
    overlay,
    headerOverlay: overlay,
    overlayBlend: true,
    showCornerOverlay: true
  };
};

/**
 * Returns the card configuration for a given credential type, if it exists.
 * @param credentialType The type of the credential to get the configuration for.
 * @param credentialColor An optional base color for the credential, used to
 * generate a configuration if a static one is not defined for the given type.
 * @param colorScheme The current app color scheme (light, dark), used to generate
 * the configuration if a static one is not defined for the given type.
 *
 * @returns The card configuration for the given credential type.
 *
 * TODO: [SIW-4216] Add credential's taxonomy as a parameter and use it to select the overlay pattern, instead of randomizing it
 */
export const getCredentialCardConfig = (
  credentialType: string,
  colorScheme: ColorSchemeName,
  credentialColor?: string
): CredentialCardConfig => {
  const staticConfig = credentialCardConfigs[credentialType];
  if (staticConfig) {
    return staticConfig;
  }

  return generateCredentialCardConfig(
    credentialType,
    colorScheme,
    credentialColor
  );
};

/**
 * Preloads the images used in the credential card configurations to improve
 * performance and reduce loading times when rendering the cards for the first
 * time.
 */
export const preloadCredentialCardAssets = (
  credentialTypes: ReadonlyArray<string>
) => {
  const assetsToPreload = credentialTypes
    // Get credential card configurations for the provided credential types
    .map(type => getCredentialCardConfig(type, undefined))
    .filter((config): config is CredentialCardConfig => config !== undefined)
    // Extract overlay and header overlay assets from the configurations, plus the corner overlay if needed
    .map(config => [
      config.overlay,
      config.headerOverlay,
      config.showCornerOverlay ? CARD_CORNER_OVERLAY : undefined
    ])
    .flat()
    .filter((asset): asset is DataSourceParam => asset !== undefined);

  preloadImages(Array.from(new Set(assetsToPreload)) as ReadonlyArray<number>);
};
