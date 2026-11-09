import { IOColors, useIOThemeContext } from "@io-app/design-system";

import { paymentsColors } from "../colors";

const paymentsColorsByMode = {
  light: paymentsColors(IOColors.light, "light"),
  dark: paymentsColors(IOColors.dark, "dark")
};

/** Payments colors of the current mode */
export const usePaymentsColors = () =>
  paymentsColorsByMode[useIOThemeContext().themeType];
