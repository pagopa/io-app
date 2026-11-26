import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  withAlpha
} from "@io-app/design-system";

/**
 * Guided tour colors of a mode. Read the current mode's with
 * `useFeatureColors(tourColors)`
 */
export const tourColors = (_: IOColorTheme, mode: IOColorMode) => ({
  /** Backdrop dimming the screen around the cutout */
  overlay: {
    background:
      mode === "dark"
        ? withAlpha(IOColorPalette.greyscale.black, 0.9)
        : withAlpha(IOColorPalette.greyscale.black, 0.5)
  }
});
