import { useIOThemeContext } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { constVoid } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";
import { updateNavigationBarColor } from "../features/settings/preferences/screens/AppearancePreferenceScreen";

export const THEME_PERSISTENCE_KEY = "selectedAppThemeConfiguration";
export type ColorModeChoice = "auto" | "dark" | "light";

export const useAppThemeConfiguration = () => {
  const { setTheme } = useIOThemeContext();
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value === undefined || value === null) {
          Appearance.setColorScheme(undefined);
          setTheme(systemColorScheme);
          updateNavigationBarColor(systemColorScheme);
          return;
        }
        const themeValue =
          value === "auto" ? undefined : (value as ColorSchemeName);
        const resolvedTheme =
          value === "auto" ? systemColorScheme : (value as ColorSchemeName);
        Appearance.setColorScheme(themeValue);
        setTheme(resolvedTheme);
        updateNavigationBarColor(resolvedTheme);
      })
      .catch(() => {
        Appearance.setColorScheme("light");
        setTheme("light");
        updateNavigationBarColor("light");
      });

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
        .then(value => {
          if (value === "auto" || value === null || value === undefined) {
            const resolvedScheme = colorScheme;
            setTheme(resolvedScheme);
            updateNavigationBarColor(resolvedScheme);
          }
        })
        .catch(constVoid);
    });

    return () => {
      subscription.remove();
    };
  }, [setTheme, systemColorScheme]);
};
