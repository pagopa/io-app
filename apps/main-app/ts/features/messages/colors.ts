import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  withAlpha
} from "@io-app/design-system";

/** Messages colors of a mode. Read the current mode's with `useMessagesColors()` */
export const messagesColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Message in the inbox list */
    listItem: {
      selectedBackground: isDark
        ? withAlpha(IOColorPalette.blueIO[300], 0.1)
        : IOColorPalette.blueIO[50],
      unreadBadge: s.foreground.accent,
      title: s.text.content.default,
      preview: s.text.content.tertiary
    }
  };
};
