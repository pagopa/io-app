import { ImageSourcePropType } from "react-native";
import { CredentialType } from "../../utils/itwMocksUtils";

export type SolidCardBackground = {
  type: "solid";
  color: string;
};

/**
 * Up to 5 color stops, distributed evenly along the gradient line.
 * At least 2 colors are required for a meaningful gradient.
 */
export type GradientColors =
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string];

export type GradientCardBackground = {
  type: "gradient";
  /**
   * Angle in degrees following the CSS convention:
   * 0° = bottom → top, 90° = left → right, 135° = top-left → bottom-right.
   */
  angle: number;
  colors: GradientColors;
  /**
   * Optional positions for each color stop, as values between 0 and 1.
   * When omitted the stops are distributed evenly (equivalent to CSS behaviour).
   * Must have the same length as `colors` when provided.
   */
  positions?: Array<number>;
};

export type CardBackgroundConfig = SolidCardBackground | GradientCardBackground;

export type CredentialCardConfig = {
  /**
   * Card background: either a solid colour or a gradient (angle + up to 5 stops).
   */
  background: CardBackgroundConfig;
  /**
   * Color used for the credential title text.
   */
  titleColor: string;
  /**
   * Color used for the card border when the credential is valid.
   */
  borderColor: string;
  /**
   * Optional PNG image rendered as a watermark layer
   * over the gradient background.
   */
  watermarkLayer?: ImageSourcePropType;
};

/**
 * TODO: Tentative, to be updated with https://pagopa.atlassian.net/browse/SIW-4077
 */
export const DEFAULT_CREDENTIAL_CARD_CONFIG: CredentialCardConfig = {
  background: {
    type: "solid",
    color: "#F2F1F0"
  },
  titleColor: "#33302B",
  borderColor: "#33302B"
};

/**
 * Per-credential static card configuration.
 * Background, title color and border color are set explicitly here.
 * An optional `watermarkLayer` PNG image can be provided to render a
 * watermark overlay on top of the background.
 * ADD MORE CONFIGURATIONS HERE IF NEEDED, ONLY FOR STATIC CREDENTIALS
 */
export const credentialCardConfigs: Partial<
  Record<string, CredentialCardConfig>
> = {
  [CredentialType.PID]: {
    background: {
      type: "gradient",
      angle: 217,
      colors: ["#EAF6FF", "#F6FBFF", "#EAF6FF", "#F9F9F9", "#EAF6FF"],
      positions: [0.0349, 0.2514, 0.4646, 0.7143, 0.9425]
    },
    titleColor: "#115486",
    borderColor: "#4F99E2",
    watermarkLayer: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_pid_watermark.png")
  },
  [CredentialType.DRIVING_LICENSE]: {
    background: {
      type: "gradient",
      angle: 249,
      colors: ["#FADCF5", "#FFECFC", "#FADCF5", "#FFECFC"],
      positions: [0.0041, 0.3614, 0.6716, 1.0251]
    },
    titleColor: "#652035",
    borderColor: "#D674A9",
    watermarkLayer: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_mdl_watermark.png")
  },
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
    background: {
      type: "gradient",
      angle: 249,
      colors: ["#B7E1FA", "#D0EDFF", "#B7E1FA", "#D0EDFF"],
      positions: [0.0031, 0.3686, 0.6772, 0.9904]
    },
    titleColor: "#032D5C",
    borderColor: "#449DCF",
    watermarkLayer: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_ts_watermark.png")
  },
  [CredentialType.EUROPEAN_DISABILITY_CARD]: {
    background: {
      type: "solid",
      color: "#D6EAF7"
    },
    titleColor: "#17406F",
    borderColor: "#6B9BB6",
    watermarkLayer: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_dc_watermark.png")
  }
};

export const getCredentialCardConfig = (
  credentialType: string
): CredentialCardConfig =>
  credentialCardConfigs[credentialType] ?? DEFAULT_CREDENTIAL_CARD_CONFIG;

/**
 * Returns the representative background color for a credential card config.
 * For solid backgrounds this is the solid color; for gradients it is the first
 * color stop (which by convention is the darker/more saturated one).
 */
export const getCredentialBackgroundColor = (
  config: CredentialCardConfig
): string =>
  config.background.type === "solid"
    ? config.background.color
    : config.background.colors[0];
