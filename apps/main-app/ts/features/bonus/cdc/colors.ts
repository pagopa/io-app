import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme
} from "@io-app/design-system";

/**
 * Carta della Cultura colors of a mode. Read the current mode's with
 * `useFeatureColors(cdcColors)`
 */
export const cdcColors = (_: IOColorTheme, mode: IOColorMode) => ({
  /** Text and icon of the card in the wallet, over its drawing */
  walletCard: {
    foreground:
      mode === "dark" ? IOColorPalette.blueIO[50] : IOColorPalette.blueIO[850]
  }
});
