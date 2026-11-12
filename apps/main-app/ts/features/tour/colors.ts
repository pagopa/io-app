import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme
} from "@io-app/design-system";

/**
 * Tour colors of a mode. Read the current mode's with
 * `useFeatureColors(tourColors)`
 */
export const tourColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Dots of the tooltip's step indicator */
    stepIndicator: {
      active: s.foreground.accent,
      inactive: isDark
        ? IOColorPalette.greyscale[450]
        : IOColorPalette.greyscale[650]
    }
  };
};
