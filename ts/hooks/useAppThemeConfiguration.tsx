import { useIOThemeContext } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";
import { useEffect } from "react";
import { constVoid } from "fp-ts/lib/function";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";

export const THEME_PERSISTENCE_KEY = "selectedAppThemeConfiguration";
export type ColorModeChoice = "system" | "dark" | "light";

export const useAppThemeConfiguration = () => {
  const { setTheme } = useIOThemeContext();
  const systemColorScheme = useColorScheme();

  useOnFirstRender(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value === undefined || value === null) {
          Appearance.setColorScheme("light");
          setTheme("light");
        }
        Appearance.setColorScheme(
          value === "system" ? undefined : (value as ColorSchemeName)
        );
        setTheme(
          value === "system" ? systemColorScheme : (value as ColorSchemeName)
        );
      })
      .catch(() => {
        Appearance.setColorScheme("light");
        setTheme("light");
      });
  });

  useEffect(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value === "system") {
          setTheme(systemColorScheme);
        }
      })
      .catch(constVoid);
  }, [systemColorScheme, setTheme]);
};
