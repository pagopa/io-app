import { useIOThemeContext } from "@pagopa/io-app-design-system";

export const ITW_BRAND_GRADIENT = [
  "#FFB357",
  "#FFEABD",
  "#1968F0",
  "#CDD2FC",
  "#FFB357",
  "#1968F0",
  "#DCE3FC"
];

const themeKeys = [
  // Screens
  "header-background",
  // Banners
  "banner-background",
  "banner-border"
] as const;

export type ItWalletTheme = {
  [K in (typeof themeKeys)[number]]: string;
};

const itWalletLightTheme: ItWalletTheme = {
  "banner-background": "#F2F9FF",
  "banner-border": "#DCE3FC",
  "header-background": "#F2F9FF"
};

const itWalletDarkTheme: ItWalletTheme = {
  "banner-background": "#0F2433",
  "banner-border": "#142C3C",
  "header-background": "#0F2433"
};

const ItWalletThemes = {
  light: itWalletLightTheme,
  dark: itWalletDarkTheme
};

export const useItWalletTheme = () => {
  const { themeType } = useIOThemeContext();
  return ItWalletThemes[themeType ?? "light"];
};
