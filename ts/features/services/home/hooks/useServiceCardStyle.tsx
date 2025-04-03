import {
  IOColors,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ViewStyle, ColorValue } from "react-native";

type ModalStyleProps = {
  default: {
    card: ViewStyle;
    foreground: IOColors;
  };
  new: {
    card: ViewStyle;
    foreground: IOColors;
  };
  skeletonColor: ColorValue;
};

/**
 * Returns the common style used for modals
 */
export const useServiceCardStyle = (): ModalStyleProps => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  const skeletonColor =
    themeType === "light" ? IOColors["grey-200"] : IOColors["grey-850"];

  const borderColor =
    themeType === "light" ? IOColors["grey-100"] : IOColors["grey-850"];

  return {
    default: {
      card: {
        borderColor,
        backgroundColor: IOColors[theme["appBackground-secondary"]]
      },
      foreground: theme["textHeading-secondary"]
    },
    new: {
      card: {
        borderColor: IOColors["hanPurple-100"],
        backgroundColor: IOColors["hanPurple-50"]
      },
      foreground: "hanPurple-850"
    },
    skeletonColor
  };
};
