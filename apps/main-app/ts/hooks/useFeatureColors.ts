import {
  IOColorMode,
  IOColorTheme,
  useIOThemeContext
} from "@io-app/design-system";
import { useMemo } from "react";

/** The colors of a feature's `colors.ts` config, for the current mode */
export const useFeatureColors = <T>(
  config: (s: IOColorTheme, mode: IOColorMode) => T
) => {
  const { colors, themeType } = useIOThemeContext();
  return useMemo(() => config(colors, themeType), [config, colors, themeType]);
};
