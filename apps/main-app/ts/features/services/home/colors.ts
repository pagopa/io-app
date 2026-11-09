import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  withAlpha
} from "@io-app/design-system";

/**
 * Colors of the services home. Read the current mode's with
 * `useServiceCardStyle()`
 */
export const servicesHomeColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Featured service and institution cards */
    featuredCard: {
      default: {
        background: s.surface.secondary,
        border: s.stroke.default,
        title: s.text.heading.secondary,
        subtitle: s.text.content.tertiary
      },
      new: {
        background: isDark
          ? withAlpha(IOColorPalette.hanPurple[250], 0.2)
          : IOColorPalette.hanPurple[50],
        border: isDark
          ? withAlpha(IOColorPalette.hanPurple[250], 0.35)
          : IOColorPalette.hanPurple[100],
        title: isDark
          ? IOColorPalette.hanPurple[50]
          : IOColorPalette.hanPurple[850],
        subtitle: isDark
          ? IOColorPalette.hanPurple[250]
          : IOColorPalette.greyscale[700]
      },
      /* Darker than `surface.skeleton` in light mode, to show on the grey card */
      skeleton: isDark
        ? IOColorPalette.greyscale[850]
        : IOColorPalette.greyscale[200]
    }
  };
};
