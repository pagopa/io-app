import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

import { IOColorMode, IOColors, IOColorTheme } from "../core/tokens";

type IOThemeContextType = {
  /* Color tokens of the resolved mode */
  colors: IOColorTheme;
  setTheme: (theme: ColorSchemeName) => void;
  /* The resolved mode: setting "unspecified" follows the system */
  themeType: IOColorMode;
};

export const IOThemeContext: Context<IOThemeContextType> =
  createContext<IOThemeContextType>({
    themeType: Appearance.getColorScheme() === "dark" ? "dark" : "light",
    colors:
      Appearance.getColorScheme() === "dark" ? IOColors.dark : IOColors.light,
    setTheme: () => void 0
  });

export const useIOThemeContext = () => useContext(IOThemeContext);

export const useIOColors = () => useIOThemeContext().colors;

type IOThemeContextProviderProps = {
  theme?: ColorSchemeName;
};

export const IOThemeContextProvider = ({
  children,
  theme
}: PropsWithChildren<IOThemeContextProviderProps>) => {
  const [currentTheme, setCurrentTheme] = useState<ColorSchemeName>(
    theme ?? "unspecified"
  );

  const resolvedTheme =
    currentTheme === "unspecified"
      ? (Appearance.getColorScheme() ?? "light")
      : currentTheme;

  const handleThemeChange = useCallback((newTheme: ColorSchemeName) => {
    setCurrentTheme(newTheme);
  }, []);

  const value = useMemo<IOThemeContextType>(
    () => ({
      themeType: resolvedTheme === "dark" ? "dark" : "light",
      colors: resolvedTheme === "dark" ? IOColors.dark : IOColors.light,
      setTheme: handleThemeChange
    }),
    [resolvedTheme, handleThemeChange]
  );

  return (
    <IOThemeContext.Provider value={value}>{children}</IOThemeContext.Provider>
  );
};
