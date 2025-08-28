import { useIOThemeContext } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";

export type ColorModeChoice = "system" | "dark" | "light";
export const THEME_PERSISTENCE_KEY = "appThemeType";

type IOThemeContextType = {
  themeType: ColorModeChoice;
  setTheme: (theme: ColorModeChoice) => void;
};

export const IOAppThemeContext: React.Context<IOThemeContextType> =
  createContext<IOThemeContextType>({
    themeType: "light",
    setTheme: (_: ColorModeChoice) => void 0
  });

export const useIOAppThemeContext = () => useContext(IOAppThemeContext);

type IOAppThemeContextProviderProps = {
  theme?: ColorModeChoice;
};

export const IOAppThemeContextProvider = ({
  children,
  theme
}: PropsWithChildren<IOAppThemeContextProviderProps>) => {
  const [currentTheme, setCurrentTheme] = useState<ColorModeChoice>(
    theme ?? "light"
  );
  const { setTheme } = useIOThemeContext();
  const systemColorScheme = useColorScheme();

  const handleThemeChange = useCallback((newTheme: ColorModeChoice) => {
    AsyncStorage.setItem(THEME_PERSISTENCE_KEY, newTheme).finally(() => {
      Appearance.setColorScheme(newTheme === "system" ? undefined : newTheme);
      setCurrentTheme(newTheme);
    });
  }, []);

  useOnFirstRender(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value === null || value === undefined) {
          Appearance.setColorScheme("light");
          setCurrentTheme("light");
          return;
        }
        Appearance.setColorScheme(
          value === "system" ? undefined : (value as ColorSchemeName)
        );
        setCurrentTheme(value as ColorModeChoice);
      })
      .catch(() => {
        Appearance.setColorScheme("light");
        setCurrentTheme("light");
      });
  });

  useEffect(() => {
    if (currentTheme === "system") {
      setTheme(systemColorScheme);
      return;
    }
    setTheme(currentTheme);
  }, [setTheme, systemColorScheme, currentTheme]);

  return (
    <IOAppThemeContext.Provider
      value={{
        themeType: currentTheme,
        setTheme: handleThemeChange
      }}
    >
      {children}
    </IOAppThemeContext.Provider>
  );
};
