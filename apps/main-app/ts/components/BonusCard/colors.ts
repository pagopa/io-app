import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  IOCustomColor,
  withAlpha
} from "@io-app/design-system";

/* Hue outside the palette */
const backgroundDark: IOCustomColor = "#35364C";

/** Default bonus card colors of a mode, for a bonus without its own `cardColors` */
export const bonusCardColors = (mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    background: isDark ? backgroundDark : IOColorPalette.blueItalia[50],
    foreground: isDark
      ? withAlpha(IOColorPalette.blueIO[300], 0.35)
      : IOColorPalette.blueItalia[100],
    text: isDark ? IOColorPalette.blueIO[50] : IOColorPalette.blueItalia[850]
  };
};

/** Counters on the bonus card; the label takes the card's `text` */
export const bonusCardCounterColors = (s: IOColorTheme) => ({
  value: s.foreground.accent,
  progress: {
    fill: s.foreground.accent,
    /* White in both modes, to show on the card background */
    track: IOColorPalette.greyscale.white
  }
});
