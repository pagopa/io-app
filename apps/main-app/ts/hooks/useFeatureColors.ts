import {
  IOColorMode,
  IOColorTheme,
  IOCustomColor,
  IOTokenColor,
  useIOThemeContext
} from "@io-app/design-system";
import { useMemo } from "react";

/**
 * A color a feature config can hold: a palette or semantic token, an alpha on
 * the `IOOpacity` scale (`withAlpha`), or a hex declared as a constant
 */
export type IOFeatureColor = IOCustomColor | IOTokenColor;

/** The colors of a feature's `colors.ts` config, nested by UI element */
export type IOFeatureColors = {
  [key: string]: IOFeatureColor | IOFeatureColors;
};

/**
 * A feature's `colors.ts` config: the colors of a mode, from its semantic
 * tokens
 */
export type IOFeatureColorsConfig<T extends IOFeatureColors> = (
  s: IOColorTheme,
  mode: IOColorMode
) => T;

/** The colors of a feature's `colors.ts` config, for the current mode */
export const useFeatureColors = <T extends IOFeatureColors>(
  config: IOFeatureColorsConfig<T>
) => {
  const { colors, themeType } = useIOThemeContext();
  return useMemo(() => config(colors, themeType), [config, colors, themeType]);
};
