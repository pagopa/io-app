import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { IOTheme, IOThemeDark, IOThemeLight } from "../core/IOColors";

export const IOThemes = {
  light: IOThemeLight,
  dark: IOThemeDark
};

type IOThemeContextType = {
  themeType: ColorSchemeName;
  theme: IOTheme;
  setTheme: (theme: ColorSchemeName) => void;
};

export const IOThemeContext: Context<IOThemeContextType> =
  createContext<IOThemeContextType>({
    themeType: Appearance.getColorScheme() ?? "unspecified",
    theme:
      Appearance.getColorScheme() === "dark" ? IOThemes.dark : IOThemes.light,
    setTheme: () => void 0
  });

export const useIOThemeContext = () => useContext(IOThemeContext);

export const useIOTheme = () => useIOThemeContext().theme;

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
      ? Appearance.getColorScheme() ?? "light"
      : currentTheme;

  const handleThemeChange = useCallback((newTheme: ColorSchemeName) => {
    setCurrentTheme(newTheme);
  }, []);

  return (
    <IOThemeContext.Provider
      value={{
        themeType: currentTheme,
        theme: resolvedTheme === "dark" ? IOThemes.dark : IOThemes.light,
        setTheme: handleThemeChange
      }}
    >
      {children}
    </IOThemeContext.Provider>
  );
};
