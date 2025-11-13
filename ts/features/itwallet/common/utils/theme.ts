import { IOColors, useIOThemeContext } from "@pagopa/io-app-design-system";
import { StatusBarStyle } from "react-native";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";

export const ITW_BRAND_GRADIENT = [
  "#FFB357",
  "#FFEABD",
  "#1968F0",
  "#CDD2FC",
  "#FFB357",
  "#1968F0",
  "#DCE3FC"
];

const themeKeys = ["background"] as const;

export type ItWalletTheme = {
  [K in (typeof themeKeys)[number]]: string;
};

const itWalletLightTheme: ItWalletTheme = {
  background: "#F2F9FF"
};

const itWalletDarkTheme: ItWalletTheme = {
  background: "#0F2433"
};

const ItWalletThemes = {
  light: itWalletLightTheme,
  dark: itWalletDarkTheme
};

export const useItWalletTheme = () => {
  const { themeType } = useIOThemeContext();
  return ItWalletThemes[themeType ?? "light"];
};
