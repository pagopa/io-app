import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme
} from "@io-app/design-system";

/**
 * IDPay colors of a mode. Read the current mode's with
 * `useFeatureColors(idPayColors)`
 */
export const idPayColors = (_: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** IDPay card in the wallet, over its drawing */
    walletCard: {
      title: isDark ? IOColorPalette.blueIO[50] : IOColorPalette.blueIO[850],
      amountLabel: isDark
        ? IOColorPalette.greyscale.white
        : IOColorPalette.blueIO[850],
      amountValue: isDark
        ? IOColorPalette.blueIO[300]
        : IOColorPalette.blueIO[500],
      expirationDate: isDark
        ? IOColorPalette.blueIO[100]
        : IOColorPalette.blueIO[850]
    },
    /** Validity of an active voucher, on the initiative's bonus card */
    cardStatus: isDark
      ? IOColorPalette.greyscale.white
      : IOColorPalette.greyscale[650]
  };
};
