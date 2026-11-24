import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme
} from "@io-app/design-system";

/** Colors of the services screens. */
export const servicesColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Header of the service and institution screens, on a grey band */
    header: {
      background: s.surface.secondary,
      title: s.text.heading.secondary,
      subtitle: s.text.content.tertiary,
      /* Darker than `surface.skeleton` in light mode, to show on the grey band */
      skeleton: isDark
        ? IOColorPalette.greyscale[850]
        : IOColorPalette.greyscale[200]
    }
  };
};
