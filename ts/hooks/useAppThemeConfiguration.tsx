import { useIOThemeContext } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";
import { updateNavigationBarColor } from "../features/settings/preferences/screens/AppearancePreferenceScreen";

export const THEME_PERSISTENCE_KEY = "selectedAppThemeConfiguration";
export type ColorModeChoice = "auto" | "dark" | "light";

export const useAppThemeConfiguration = () => {
  const { setTheme, themeType } = useIOThemeContext();
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value === undefined || value === null || value === "auto") {
          Appearance.setColorScheme(undefined);
          setTheme(systemColorScheme);
          return;
        }
        const colorScheme = value as ColorSchemeName;
        Appearance.setColorScheme(colorScheme);
        setTheme(colorScheme);
      })
      .catch(() => {
        Appearance.setColorScheme("light");
        setTheme("light");
      });
  }, [setTheme, systemColorScheme]);

  useEffect(() => {
    updateNavigationBarColor(themeType);
  }, [themeType]);
};
