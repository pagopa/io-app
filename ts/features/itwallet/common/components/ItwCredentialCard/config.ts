import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { DataSourceParam } from "@shopify/react-native-skia";
import Color from "color";
import { useMemo } from "react";
import { ColorSchemeName } from "react-native";
import { fnv1a } from "../../../../../utils/hash";
import {
  CREDENTIAL_BASE_OVERLAYS,
  CREDENTIAL_CARD_OVERLAYS,
  CREDENTIAL_HEADER_OVERLAYS
} from "../../utils/assets";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItWalletThemes } from "../../utils/theme";

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
  overlay?: DataSourceParam;
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
 * Generates a credential card configuration based on the provided base color.
 * @param color A string representing the base color for the credential card,
 * used to derive the background and title colors.
 * @param colorScheme The current app color scheme (light, dark)
 * @return A credential card configuration derived from the provided color
 */
export const generateCredentialCardConfig = (
  color: string,
  colorScheme?: ColorSchemeName
): CredentialCardConfig => {
  const theme = ItWalletThemes[colorScheme || "light"];
  const isLight = colorScheme !== "dark";

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

  return {
    color,
    background: {
      colors: [backgroundColor, theme["card-background"]]
    },
    borderColor,
    titleColor
  };
};

/**
 * Generates a random credential card configuration based on the provided seed
 * and taxonomy, used as a fallback for credential types that don't have a
 * specific configuration defined.
 * @param seed An unknown value used to generate a deterministic random
 * configuration.
 * @param colorScheme The current app color scheme (light, dark)
 * @returns A randomly generated credential card configuration.
 *
 * TODO: [SIW-4216] Add credential's taxonomy as a parameter and use it to select the overlay pattern, instead of randomizing it
 */
export const getRandomCredentialCardConfig = (
  seed: unknown,
  colorScheme?: ColorSchemeName
): CredentialCardConfig => {
  const colorHash = fnv1a(String(seed));
  const colorHex = BASE_COLORS[colorHash % BASE_COLORS.length];

  // TODO: [SIW-4216] Select credential overlay based on credential taxonomy, not randomly
  const overlayHash = fnv1a(String(seed), 1);
  const overlaySource =
    CREDENTIAL_BASE_OVERLAYS[overlayHash % CREDENTIAL_BASE_OVERLAYS.length];

  return {
    ...generateCredentialCardConfig(colorHex, colorScheme),
    overlay: overlaySource,
    headerOverlay: overlaySource,
    overlayBlend: true,
    showCornerOverlay: true
  };
};

/**
 * Returns the card configuration for a given credential type, if it exists.
 * @param credentialType The type of the credential to get the configuration for.
 * @returns The card configuration for the given credential type.
 */
export const getCredentialCardConfig = (
  credentialType: string
): CredentialCardConfig | undefined => credentialCardConfigs[credentialType];

/**
 *
 * @param credentialType
 * @returns
 */
export const useCredentialCardConfiguration = (credentialType: string) => {
  const { themeType } = useIOThemeContext();
  // TODO get credential color from metadata
  const credentialColor = undefined;

  return useMemo(() => {
    const staticConfig = credentialCardConfigs[credentialType];
    if (staticConfig) {
      return staticConfig;
    }

    if (credentialColor) {
      return generateCredentialCardConfig(credentialColor, themeType);
    }
    return getRandomCredentialCardConfig(credentialType, themeType);
  }, [credentialType, credentialColor, themeType]);
};
