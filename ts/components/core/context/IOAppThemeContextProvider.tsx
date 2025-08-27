import {
  IOThemeContextProvider,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { Appearance, useColorScheme } from "react-native";

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

  useEffect(() => {
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => handleThemeChange((value as ColorModeChoice) ?? "light"))
      .catch(() => {
        handleThemeChange("light");
      });
  });
  const handleThemeChange = (newTheme: ColorModeChoice) => {
    AsyncStorage.setItem(THEME_PERSISTENCE_KEY, newTheme).finally(() => {
      Appearance.setColorScheme(newTheme === "system" ? undefined : newTheme);
      setCurrentTheme(newTheme);
      setTheme(systemColorScheme);
    });
  };

  return (
    <IOAppThemeContext.Provider
      value={{
        themeType: currentTheme,
        setTheme: handleThemeChange
      }}
    >
      <IOThemeContextProvider>{children}</IOThemeContextProvider>
    </IOAppThemeContext.Provider>
  );
};
