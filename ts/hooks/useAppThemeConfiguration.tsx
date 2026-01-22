import { useIOThemeContext } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { constVoid } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";
import { updateNavigationBarColor } from "../features/settings/preferences/screens/AppearancePreferenceScreen";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";

export const THEME_PERSISTENCE_KEY = "selectedAppThemeConfiguration";
export type ColorModeChoice = "auto" | "dark" | "light";

export const useAppThemeConfiguration = () => {
  const { setTheme } = useIOThemeContext();
  const systemColorScheme = useColorScheme();

  useOnFirstRender(() => {
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
  });

  useEffect(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value === "auto") {
          setTheme(systemColorScheme);
          updateNavigationBarColor(systemColorScheme);
        }
      })
      .catch(constVoid);
  }, [systemColorScheme, setTheme]);
};
