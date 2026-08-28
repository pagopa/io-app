import { requireNativeModule } from "expo-modules-core";

export type NavigationBarTheme = "dark" | "light";

interface NavigationBarManagerModuleType {
  setNavigationBarColor: (
    theme: NavigationBarTheme,
    backgroundColor: string
  ) => Promise<boolean>;
}

const NavigationBarManagerModule =
  requireNativeModule<NavigationBarManagerModuleType>("NavigationBarManager");

/**
 * Sets the Android navigation bar color and icon contrast for the given theme.
 */
export const setNavigationBarColor = (
  theme: NavigationBarTheme,
  backgroundColor: string
): Promise<boolean> =>
  NavigationBarManagerModule.setNavigationBarColor(theme, backgroundColor);
