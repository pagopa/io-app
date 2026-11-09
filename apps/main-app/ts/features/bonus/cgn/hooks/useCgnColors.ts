import { IOColors, useIOThemeContext } from "@io-app/design-system";

import { cgnColors } from "../colors";

const cgnColorsByMode = {
  light: cgnColors(IOColors.light, "light"),
  dark: cgnColors(IOColors.dark, "dark")
};

/** CGN colors of the current mode */
export const useCgnColors = () =>
  cgnColorsByMode[useIOThemeContext().themeType];
