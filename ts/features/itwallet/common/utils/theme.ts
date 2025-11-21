import { useIOThemeContext } from "@pagopa/io-app-design-system";

export const ITW_BRAND_GRADIENT = [
  "rgba(220, 227, 252, 1)",
  "rgba(25, 104, 240, 1)",
  "rgba(255, 179, 87, 1)",
  "rgba(205, 210, 252, 1)",
  "rgba(25, 104, 240, 1)",
  "rgba(255, 234, 189, 1)",
  "rgba(255, 179, 87, 1)"
];

export const ITW_BRAND_GRADIENT_WARNING = [
  "rgba(255, 179, 87, 1)",
  "rgba(255, 234, 189, 1)",
  "rgba(255, 179, 87, 1)",
  "rgba(205, 210, 252, 1)",
  "rgba(255, 179, 87, 1)",
  "rgba(255, 234, 189, 1)",
  "rgba(220, 227, 252, 1)"
];

export const ITW_BRAND_GRADIENT_ERROR = [
  "rgba(255, 87, 87, 1)",
  "rgba(255, 189, 189, 1)",
  "rgba(255, 87, 87, 1)",
  "rgba(252, 205, 205, 1)",
  "rgba(255, 87, 87, 1)",
  "rgba(255, 189, 189, 1)",
  "rgba(220, 227, 252, 1)"
];

const themeKeys = [
  // Screens
  "header-background",
  // Banners
  "banner-background"
] as const;

export type ItWalletTheme = {
  [K in (typeof themeKeys)[number]]: string;
};

const itWalletLightTheme: ItWalletTheme = {
  "banner-background": "#F2F9FF",
  "header-background": "#F2F9FF"
};

const itWalletDarkTheme: ItWalletTheme = {
  "banner-background": "#0F2433",
  "header-background": "#0F2433"
};

const ItWalletThemes = {
  light: itWalletLightTheme,
  dark: itWalletDarkTheme
};

/**
 * Returns IT-Wallet specific theme colors based on the current app theme (light/dark).
 */
export const useItWalletTheme = () => {
  const { themeType } = useIOThemeContext();
  return ItWalletThemes[themeType ?? "light"];
};
