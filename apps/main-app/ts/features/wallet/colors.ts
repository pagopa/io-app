import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme
} from "@io-app/design-system";

/**
 * Wallet colors of a mode. Read the current mode's with
 * `useFeatureColors(walletColors)`
 */
export const walletColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Placeholder card while the wallet loads */
    cardSkeleton: {
      background: s.surface.skeleton,
      // Bars contrast with the card, which already has the skeleton color
      bar: isDark
        ? IOColorPalette.greyscale[900]
        : IOColorPalette.greyscale[200]
    }
  };
};
