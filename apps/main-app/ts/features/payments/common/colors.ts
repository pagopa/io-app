import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  withAlpha
} from "@io-app/design-system";

/**
 * Payments colors of a mode. Read the current mode's with
 * `useFeatureColors(paymentsColors)`
 */
export const paymentsColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Payment method cards (`PaymentCard`, `PaymentCardSmall`) */
    card: {
      background: s.surface.tertiary,
      border: isDark
        ? IOColorPalette.greyscale.black
        : IOColorPalette.greyscale[200],
      text: s.text.heading.default,
      skeleton: isDark
        ? withAlpha(IOColorPalette.greyscale[450], 0.5)
        : IOColorPalette.greyscale[200],
      expired: {
        background: s.surface.error,
        border: s.stroke.error,
        text: s.foreground.onTint.error
      }
    },
    /** Payment method details screen */
    details: {
      background: s.background.default,
      header: IOColorPalette.blueIO[600]
    }
  };
};
