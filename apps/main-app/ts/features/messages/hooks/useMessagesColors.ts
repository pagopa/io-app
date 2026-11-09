import { IOColors, useIOThemeContext } from "@io-app/design-system";

import { messagesColors } from "../colors";

const messagesColorsByMode = {
  light: messagesColors(IOColors.light, "light"),
  dark: messagesColors(IOColors.dark, "dark")
};

/** Messages colors of the current mode */
export const useMessagesColors = () =>
  messagesColorsByMode[useIOThemeContext().themeType];
