import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export type NavigationBarTheme = "dark" | "light";

interface NavigationBarManagerModuleType {
  setNavigationBarColor: (
    theme: NavigationBarTheme,
    backgroundColor: string
  ) => Promise<boolean>;
}

const NavigationBarManagerModule =
  Platform.OS === "android"
    ? requireNativeModule<NavigationBarManagerModuleType>(
        "NavigationBarManager"
      )
    : undefined;

/**
 * Sets the Android navigation bar color and icon contrast for the given theme.
 */
export const setNavigationBarColor = (
  theme: NavigationBarTheme,
  backgroundColor: string
): Promise<boolean> =>
  NavigationBarManagerModule?.setNavigationBarColor(theme, backgroundColor) ??
  Promise.resolve(false);
