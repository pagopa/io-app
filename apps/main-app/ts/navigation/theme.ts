import {
  IOColorsLegacy,
  IOThemeDark,
  IOThemeLight
} from "@io-app/design-system";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

// React Navigation Themes
// Dark & Light mode
export const IONavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: IOColorsLegacy[IOThemeDark["appBackground-primary"]],
    card: IOColorsLegacy[IOThemeDark["appBackground-primary"]]
  }
};

export const IONavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: IOColorsLegacy[IOThemeLight["appBackground-primary"]],
    card: IOColorsLegacy[IOThemeLight["appBackground-primary"]]
  }
};
