import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  IOCustomColor,
  IOTokenColor,
  withAlpha
} from "@io-app/design-system";

import type { ItwCredentialStatus } from "./common/utils/itwTypesUtils";

const brandedBackgroundLight: IOCustomColor = "#F2F9FF";
const brandedBackgroundDark: IOCustomColor = "#0F2433";
const cardBackgroundLight: IOCustomColor = "#F2F2F2";
const cardBackgroundDark: IOCustomColor = "#1A1A1A";

const { white, black } = IOColorPalette.greyscale;

/**
 * IT Wallet colors of a mode. Read the current mode's with
 * `useFeatureColors(itwColors)`
 */
export const itwColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  const cardBackground = isDark ? cardBackgroundDark : cardBackgroundLight;
  // Same in both modes, as before: not yet reviewed for dark mode
  const errorBorder = IOColorPalette.red[600];
  const warningBorder = IOColorPalette.yellow[700];

  return {
    /** Box with the branded animated border */
    brandedBox: {
      background: isDark ? brandedBackgroundDark : brandedBackgroundLight
    },
    /** Credential card, digital or skeuomorphic */
    credentialCard: {
      gradientEnd: cardBackground,
      ring: s.background.default,
      fadedOverlay: isDark ? black : white,
      border: {
        valid: s.background.default,
        invalid: errorBorder,
        suspended: errorBorder,
        expired: errorBorder,
        expiring: warningBorder,
        jwtExpired: errorBorder,
        jwtExpiring: warningBorder,
        unknown: IOColorPalette.greyscale[300]
      } satisfies Record<ItwCredentialStatus, IOTokenColor>,
      upgradePendingBorder: errorBorder
    },
    /**
     * Replica of a physical card: same in both modes, so it looks like the
     * printed one
     */
    skeumorphicCard: {
      background: IOColorPalette.greyscale[100],
      label: IOColorPalette.greyscale[900],
      fadedOverlay: withAlpha(white, 0.7),
      shadow: withAlpha(black, 0.1)
    },
    /** Card with the claims of a credential */
    claimsCard: {
      background: s.background.default,
      border: s.stroke.default,
      headerGradientStart: cardBackground
    },
    /**
     * Fiscal code barcode, a replica of the health card: same in both modes, so
     * scanners can read it
     */
    fiscalCode: {
      background: white,
      border: IOColorPalette.greyscale[100],
      code: black
    }
  };
};
