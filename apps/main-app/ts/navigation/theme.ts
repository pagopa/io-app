import { IOColors } from "@io-app/design-system";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

// React Navigation Themes
// Dark & Light mode
export const IONavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: IOColors.dark.background.default,
    card: IOColors.dark.background.default
  }
};

export const IONavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: IOColors.light.background.default,
    card: IOColors.light.background.default
  }
};
