import { ImageSourcePropType } from "react-native";
import { CredentialType } from "../../utils/itwMocksUtils";
import { useItWalletTheme } from "../../utils/theme";

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
  overlay?: ImageSourcePropType;
  /**
   * Optional PNG image rendered as an overlay layer in the credential detail
   * header.
   */
  detailOverlay?: ImageSourcePropType;
};

/**
 * Per-credential static card configuration.
 * Background, title color and border color are set explicitly here.
 * An optional `watermarkLayer` PNG image can be provided to render a
 * watermark overlay on top of the background.
 * TODO: these configurations are tentative, will be updated once the design will be finalized
 * ADD MORE CONFIGURATIONS HERE IF NEEDED, ONLY FOR STATIC CREDENTIALS
 */
export const credentialCardConfigs: Partial<
  Record<string, CredentialCardConfig>
> = {
  [CredentialType.PID]: {
    background: {
      colors: ["#EAF6FF", "#F6FBFF", "#EAF6FF", "#F9F9F9", "#EAF6FF"],
      positions: [0.0349, 0.2514, 0.4646, 0.7143, 0.9425],
      angle: 217
    },
    titleColor: "#115486",
    borderColor: "#4F99E2",
    overlay: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_pid_watermark.png"),
    detailOverlay: require("../../../../../../img/features/itWallet/cards/detailWatermarks/itw_pid_detail_watermark.png")
  },
  [CredentialType.DRIVING_LICENSE]: {
    background: {
      colors: ["#FADCF5", "#FFECFC", "#FADCF5", "#FFECFC"],
      positions: [0.0041, 0.3614, 0.6716, 1.0251],
      angle: 249
    },
    titleColor: "#652035",
    borderColor: "#D674A9",
    overlay: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_mdl_watermark.png"),
    detailOverlay: require("../../../../../../img/features/itWallet/cards/detailWatermarks/itw_mdl_detail_watermark.png")
  },
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
    background: {
      colors: ["#B7E1FA", "#D0EDFF", "#B7E1FA", "#D0EDFF"],
      positions: [0.0031, 0.3686, 0.6772, 0.9904],
      angle: 249
    },
    titleColor: "#032D5C",
    borderColor: "#449DCF",
    overlay: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_ts_watermark.png"),
    detailOverlay: require("../../../../../../img/features/itWallet/cards/detailWatermarks/itw_ts_detail_watermark.png")
  },
  [CredentialType.EUROPEAN_DISABILITY_CARD]: {
    background: {
      colors: ["#D6EAF7"]
    },
    titleColor: "#17406F",
    borderColor: "#6B9BB6",
    overlay: require("../../../../../../img/features/itWallet/cards/cardWatermarks/itw_dc_watermark.png"),
    detailOverlay: require("../../../../../../img/features/itWallet/cards/detailWatermarks/itw_dc_detail_watermark.png")
  }
};

export const useCredentialConfiguration = (credentialType: string) => {
  const theme = useItWalletTheme();

  const config = credentialCardConfigs[credentialType] ??
    credentialCardConfigs[credentialType] ?? {
      background: {
        colors: ["#F2F1F0"]
      },
      titleColor: "#33302B",
      borderColor: "#33302B"
    };

  return config;
};

export const getCredentialCardConfig = (
  credentialType: string
): CredentialCardConfig =>
  credentialCardConfigs[credentialType] ?? {
    background: {
      colors: ["#F2F1F0"]
    },
    titleColor: "#33302B",
    borderColor: "#33302B"
  };

/**
 * Returns the representative background color for a credential card config.
 * For solid backgrounds this is the solid color; for gradients it is the first
 * color stop (which by convention is the darker/more saturated one).
 */
export const getCredentialBackgroundColor = (
  config: CredentialCardConfig
): string => config.background.colors[0];
