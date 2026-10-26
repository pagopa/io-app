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

import { IOTheme, IOThemeDark, IOThemeLight } from "../core/IOColorsLegacy";
import { IOColorMode, IOColors, IOColorTheme } from "../core/tokens";

export const IOThemes = {
  light: IOThemeLight,
  dark: IOThemeDark
};

type IOThemeContextType = {
  /* The resolved mode: `themeType` can be "unspecified" */
  colorMode: IOColorMode;
  /* Color tokens of the resolved mode */
  colors: IOColorTheme;
  setTheme: (theme: ColorSchemeName) => void;
  theme: IOTheme;
  themeType: ColorSchemeName;
};

export const IOThemeContext: Context<IOThemeContextType> =
  createContext<IOThemeContextType>({
    themeType: Appearance.getColorScheme() ?? "unspecified",
    colorMode: Appearance.getColorScheme() === "dark" ? "dark" : "light",
    colors:
      Appearance.getColorScheme() === "dark" ? IOColors.dark : IOColors.light,
    theme:
      Appearance.getColorScheme() === "dark" ? IOThemes.dark : IOThemes.light,
    setTheme: () => void 0
  });

export const useIOThemeContext = () => useContext(IOThemeContext);

/** @deprecated Use `useIOColors`, will be removed in the next major release */
export const useIOTheme = () => useIOThemeContext().theme;

export const useIOColors = () => useIOThemeContext().colors;

/* The resolved mode, unlike `themeType`: use it instead of `themeType === "dark"` */
export const useIOColorMode = () => useIOThemeContext().colorMode;

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
      themeType: currentTheme,
      colorMode: resolvedTheme === "dark" ? "dark" : "light",
      theme: resolvedTheme === "dark" ? IOThemes.dark : IOThemes.light,
      colors: resolvedTheme === "dark" ? IOColors.dark : IOColors.light,
      setTheme: handleThemeChange
    }),
    [currentTheme, resolvedTheme, handleThemeChange]
  );

  return (
    <IOThemeContext.Provider value={value}>{children}</IOThemeContext.Provider>
  );
};
