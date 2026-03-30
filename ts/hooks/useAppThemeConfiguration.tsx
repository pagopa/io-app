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
        if (value === null || value === "auto") {
          // there's an issue on new react-native color scheme handling
          // see https://github.com/facebook/react-native/issues/54959
          // TODO: remove this timeout once the issue is fixed
          const timeoutId = setTimeout(() => {
            Appearance.setColorScheme("unspecified");
          }, 50);
          setTheme(systemColorScheme);
          return () => clearTimeout(timeoutId);
        }
        const colorScheme = value as ColorSchemeName;
        Appearance.setColorScheme(colorScheme);
        setTheme(colorScheme);
        // eslint-disable-next-line sonarjs/no-redundant-jump
        return;
      })
      .catch(() => {
        Appearance.setColorScheme("light");
        setTheme("light");
      });
  }, [setTheme, systemColorScheme]);

  useEffect(() => {
    updateNavigationBarColor(themeType === "unspecified" ? "auto" : themeType);
  }, [themeType]);
};
