import {
  hexToRgba,
  IOColorsLegacy,
  IODimensions,
  useIOTheme,
  useIOThemeContext
} from "@io-app/design-system";
import { ColorValue, ViewStyle } from "react-native";

type ServiceCardStyleProps = {
  default: {
    card: ViewStyle;
    foreground: {
      primary: IOColorsLegacy;
      secondary: IOColorsLegacy;
    };
  };
  new: {
    card: ViewStyle;
    foreground: {
      primary: IOColorsLegacy;
      secondary: IOColorsLegacy;
    };
  };
  skeletonColor: ColorValue;
};

/** Returns the common style used for service cards */
export const useServiceCardStyle = (): ServiceCardStyleProps => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  return {
    default: {
      card: {
        borderRadius: IODimensions.radius.card,
        borderCurve: "continuous",
        borderWidth: IODimensions.stroke.default,
        borderColor: IOColorsLegacy[theme["cardBorder-default"]],
        backgroundColor: IOColorsLegacy[theme["appBackground-secondary"]]
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
            ? IOColorsLegacy["hanPurple-100"]
            : hexToRgba(IOColorsLegacy["hanPurple-250"], 0.3),
        backgroundColor:
          themeType === "light"
            ? IOColorsLegacy["hanPurple-50"]
            : hexToRgba(IOColorsLegacy["hanPurple-250"], 0.2)
      },
      foreground: {
        primary: themeType === "light" ? "hanPurple-850" : "hanPurple-50",
        secondary: themeType === "light" ? "grey-700" : "hanPurple-250"
      }
    },
    skeletonColor:
      themeType === "light"
        ? IOColorsLegacy["grey-200"]
        : IOColorsLegacy["grey-850"]
  };
};
