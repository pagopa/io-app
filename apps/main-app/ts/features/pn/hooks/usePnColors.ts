import { IOColors, useIOThemeContext } from "@io-app/design-system";

import { pnColors } from "../colors";

const pnColorsByMode = {
  light: pnColors(IOColors.light),
  dark: pnColors(IOColors.dark)
};

/** SEND colors of the current mode */
export const usePnColors = () => pnColorsByMode[useIOThemeContext().themeType];
