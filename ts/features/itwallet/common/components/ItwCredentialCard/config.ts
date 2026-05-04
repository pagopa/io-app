import { DataSourceParam } from "@shopify/react-native-skia";
import Color from "color";
import { ColorSchemeName } from "react-native";
import { XOR } from "../../../../../types/utils";
import { fnv1a } from "../../../../../utils/hash";
import { preloadImages } from "../../utils/imageCache";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItWalletThemes } from "../../utils/theme";
import { CREDENTIAL_CARD_CORNER_OVERLAY } from "./CardOverlay";

/**
 * Colors from which random configurations will be generated, based on the
 * provided seed.
 */
export const CREDENTIAL_BASE_COLORS = [
  "#FFB357",
  "#CDD2FC",
  "#7AC1FA",
  "#003366"
];

/**
 * Pattern overlay images by credential taxonomy category
 * !IMPORTANT: keys are provisional and may change in the future once the taxonomy is finalized.
 */
export const CREDENTIAL_CARD_PATTERN_OVERLAYS = {
  bonus: require("../../../../../../img/features/itWallet/cards/overlay/pattern/bonus.png"),
  education: require("../../../../../../img/features/itWallet/cards/overlay/pattern/education.png"),
  family: require("../../../../../../img/features/itWallet/cards/overlay/pattern/family.png"),
  financial: require("../../../../../../img/features/itWallet/cards/overlay/pattern/financial.png"),
  health: require("../../../../../../img/features/itWallet/cards/overlay/pattern/health.png"),
  identity: require("../../../../../../img/features/itWallet/cards/overlay/pattern/identity.png"),
  lifestyle: require("../../../../../../img/features/itWallet/cards/overlay/pattern/lifestyle.png"),
  travel: require("../../../../../../img/features/itWallet/cards/overlay/pattern/travel.png"),
  work: require("../../../../../../img/features/itWallet/cards/overlay/pattern/work.png")
};

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
} & XOR<
  {
    /**
     * Type of the gradient, either linearor radial.
     */
    type: "linear";
    /**
     * Angle in degrees following the CSS convention:
     * 0° = bottom → top, 90° = left → right, 135° = top-left → bottom-right.
     */
    angle: number;
  },
  {
    /**
     * Type of the gradient, either linear (default) or radial.
     */
    type: "radial";
    /**
     * Center of the gradient expressed in percentage values between 0 and 1,
     * where [0.5, 0.5] corresponds to the center of the card.
     */
    center: [number, number];

    /**
     * Radius of the gradient, expressed as a percentage of the card width, between 0 and 1.
     */
    radius: number;
  }
>;

export type CredentialCardOverlay = XOR<
  {
    /**
     * A fixed overlay image applied to the credential card
     */
    card: DataSourceParam;
    /**
     * Optional fixed overlay image applied to the credential detail header.
     * If not provided, the card overlay will be used in the header as well.
     */
    header?: DataSourceParam;
  },
  {
    /**
     * A pattern overlay applied to the credential card and header
     */
    pattern: DataSourceParam;
    /**
     * Whether to apply the corner overlay on top of the background
     */
    showCornerOverlay?: boolean;
  }
>;

export type CredentialCardConfig = {
  /**
   * Base color for the credential, defined by the AS or in static configurations.
   */
  color: string;
  /**
   * Color used for the credential title text.
   */
  titleColor: string;
  /**
   * Color used for the card border when the credential is valid.
   */
  borderColor: string;
  /**
   * Card background: either a solid colour or a gradient (angle + up to 5 stops).
   */
  background: CredentialCardBackground;
  /**
   * Overlay configuration for the credential card, either a fixed image or a pattern
   */
  overlay?: CredentialCardOverlay;
};

/**
 * A credential card configuration that varies based on the app color scheme (light/dark).
 */
export type ThemeAwareCredentialCardConfig = Record<
  "light" | "dark",
  CredentialCardConfig
>;

/**
 * Type guard to determine if a credential card configuration is theme-aware or not.
 */
export const isThemeAwareCredentialCardConfig = (
  config: CredentialCardConfig | ThemeAwareCredentialCardConfig
): config is ThemeAwareCredentialCardConfig =>
  "light" in config && "dark" in config;

/**
 * Per-credential static card configuration.
 * Background, title color and border color are set explicitly here.
 * An optional `overlay` PNG image can be provided to render an overlay on top of the background.
 *
 * ADD MORE CONFIGURATIONS HERE IF NEEDED, ONLY FOR STATIC CREDENTIALS
 */
export const credentialCardConfigs: Partial<
  Record<string, CredentialCardConfig | ThemeAwareCredentialCardConfig>
> = {
  [CredentialType.PID]: {
    light: {
      color: "#EAF6FF",
      titleColor: "#115486",
      borderColor: "#4F99E2",
      background: {
        type: "linear",
        colors: ["#EAF6FF", "#F6FBFF", "#EAF6FF", "#F9F9F9", "#EAF6FF"],
        positions: [0.0349, 0.2514, 0.4646, 0.7143, 0.9425],
        angle: 217
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/pid_card_dark.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/pid_header.png")
      }
    },
    dark: {
      color: "#24375A",
      titleColor: "#C4DCF5",
      borderColor: "#738199",
      background: {
        type: "linear",
        colors: ["#233966", "#26344B", "#233966"],
        positions: [0.0349, 0.4887, 0.9425],
        angle: 217
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/pid_card.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/pid_header.png")
      }
    }
  },
  [CredentialType.DRIVING_LICENSE]: {
    light: {
      color: "#FADCF5",
      titleColor: "#652035",
      borderColor: "#D674A9",
      background: {
        type: "linear",
        colors: ["#FADCF5", "#FFECFC", "#FADCF5", "#FFECFC"],
        positions: [0.0041, 0.3614, 0.6716, 1.0251],
        angle: 249
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/mdl_card.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/mdl_header.png")
      }
    },
    dark: {
      color: "#2A092E",
      titleColor: "#FADCF5",
      borderColor: "#997387",
      background: {
        type: "linear",
        colors: ["#401B37", "#290744", "#2A0A2A", "#370945"],
        positions: [0.0041, 0.3726, 0.6722, 1.026],
        angle: 249
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/mdl_card_dark.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/mdl_header.png")
      }
    }
  },
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
    light: {
      color: "#B7E1FA",
      titleColor: "#032D5C",
      borderColor: "#449DCF",
      background: {
        type: "linear",
        colors: ["#B7E1FA", "#D0EDFF", "#B7E1FA", "#D0EDFF"],
        positions: [0.0031, 0.3686, 0.6772, 0.9904],
        angle: 249
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/ts_card.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/ts_header.png")
      }
    },
    dark: {
      color: "#112F51",
      titleColor: "#D5E9FF",
      borderColor: "#738499",
      background: {
        type: "linear",
        colors: ["#0B2A4A", "#1E3A5F", "#0B2A4A", "#1E3A5F"],
        positions: [0.0031, 0.3686, 0.6772, 0.9905],
        angle: 249
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/ts_card_dark.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/ts_header.png")
      }
    }
  },
  [CredentialType.EUROPEAN_DISABILITY_CARD]: {
    light: {
      color: "#D6EAF7",
      titleColor: "#17406F",
      borderColor: "#6B9BB6",
      background: {
        type: "radial",
        colors: ["#E5F0F7", "#D6DDE2", "#DFE9EF", "#C7D0DB"],
        positions: [0, 0.2223, 0.4999, 1],
        center: [1, 0.195],
        radius: 1.0564
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/dc_card.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/dc_header.png")
      }
    },
    dark: {
      color: "#233B4D",
      titleColor: "#D6EAF7",
      borderColor: "#6B9BB6",
      background: {
        type: "radial",
        colors: ["#1A3547", "#3B4C57", "#1D3749", "#3C4E60"],
        positions: [0, 0.2223, 0.4999, 1],
        center: [1, 0.195],
        radius: 1.0564
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/dc_card_dark.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/dc_header.png")
      }
    }
  },
  [CredentialType.AGE_VERIFICATION]: {
    light: {
      color: "#CECFF2",
      titleColor: "#363740",
      borderColor: "#9490BE",
      background: {
        type: "linear",
        colors: ["#CECFF2", "#ECECEC"],
        angle: 69
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/av_card.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/av_header.png")
      }
    },
    dark: {
      color: "#2E2647",
      titleColor: "#D9CDED",
      borderColor: "#767399",
      background: {
        type: "linear",
        colors: ["#0B2A4A", "#1E3A5F", "#0B2A4A", "#1E3A5F"],
        positions: [0.0031, 0.3686, 0.6772, 0.9905],
        angle: 249
      },
      overlay: {
        card: require("../../../../../../img/features/itWallet/cards/overlay/av_card_dark.png"),
        header: require("../../../../../../img/features/itWallet/cards/overlay/av_header.png")
      }
    }
  }
};

/**
 * Generates a color based on credential type
 */
const generateBaseColorFromCredentialType = (
  credentialType: string
): string => {
  const colorHash = fnv1a(credentialType);
  return CREDENTIAL_BASE_COLORS[colorHash % CREDENTIAL_BASE_COLORS.length];
};

/**
 * Generates an overlay asset based on credential type
 */
const generateBaseOverlayFromCredentialType = (
  credentialType: string
): DataSourceParam => {
  const overlayHash = fnv1a(credentialType, 1);
  const keys = Object.keys(CREDENTIAL_CARD_PATTERN_OVERLAYS) as Array<
    keyof typeof CREDENTIAL_CARD_PATTERN_OVERLAYS
  >;
  const key = keys[overlayHash % keys.length];
  return CREDENTIAL_CARD_PATTERN_OVERLAYS[key];
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
  const patternOverlay = generateBaseOverlayFromCredentialType(credentialType);

  return {
    color,
    borderColor,
    titleColor,
    background: {
      type: "linear",
      colors: [backgroundColor, theme["card-background"]],
      angle: 0
    },
    overlay: {
      pattern: patternOverlay,
      showCornerOverlay: true
    }
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
    if (isThemeAwareCredentialCardConfig(staticConfig)) {
      // Selects the appropriate credential card configuration based on the
      // current color scheme.
      return staticConfig[colorScheme || "light"];
    }
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
  credentialTypes: ReadonlyArray<string>,
  colorScheme: ColorSchemeName
) => {
  const assetsToPreload = credentialTypes
    // Get credential card configurations for the provided credential types
    .map(type => getCredentialCardConfig(type, colorScheme))
    // Extract overlay assets from the configurations
    .map(({ overlay }) => [
      overlay?.card,
      overlay?.header,
      overlay?.pattern,
      overlay?.showCornerOverlay ? CREDENTIAL_CARD_CORNER_OVERLAY : undefined
    ])
    .flat()
    // Filter out undefined assets
    .filter((asset): asset is DataSourceParam => asset !== undefined);

  preloadImages(Array.from(new Set(assetsToPreload)) as ReadonlyArray<number>);
};
