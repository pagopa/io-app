import {
  hexToRgba,
  IOColors,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ViewStyle, ColorValue } from "react-native";

type ServiceCardStyleProps = {
  default: {
    card: ViewStyle;
    foreground: {
      primary: IOColors;
      secondary: IOColors;
    };
  };
  new: {
    card: ViewStyle;
    foreground: {
      primary: IOColors;
      secondary: IOColors;
    };
  };
  skeletonColor: ColorValue;
};

/**
 * Returns the common style used for service cards
 */
export const useServiceCardStyle = (): ServiceCardStyleProps => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  return {
    default: {
      card: {
        borderColor:
          themeType === "light" ? IOColors["grey-100"] : IOColors["grey-850"],
        backgroundColor: IOColors[theme["appBackground-secondary"]]
      },
      foreground: {
        primary: theme["textHeading-secondary"],
        secondary: theme["textBody-tertiary"]
      }
    },
    new: {
      card: {
        borderColor:
          themeType === "light"
            ? IOColors["hanPurple-100"]
            : hexToRgba(IOColors["hanPurple-250"], 0.3),
        backgroundColor:
          themeType === "light"
            ? IOColors["hanPurple-50"]
            : hexToRgba(IOColors["hanPurple-250"], 0.2)
      },
      foreground: {
        primary: themeType === "light" ? "hanPurple-850" : "hanPurple-50",
        secondary: themeType === "light" ? "grey-700" : "hanPurple-250"
      }
    },
    skeletonColor:
      themeType === "light" ? IOColors["grey-200"] : IOColors["grey-850"]
  };
};
