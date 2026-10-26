import {
  hexToRgba,
  IOColorsLegacy,
  useIOTheme,
  useIOThemeContext
} from "@io-app/design-system";
import { ColorValue } from "react-native";

type CgnStyleProps = {
  header: {
    // It should be `ColorValue`, but we need to adapt the `useHeaderSecondLevel` hook first
    default: {
      backgroundColor: string;
      foreground: IOColorsLegacy;
    };
    new: {
      backgroundColor: string;
      foreground: IOColorsLegacy;
    };
  };
  module: {
    default: {
      backgroundColor: ColorValue;
      borderColor: ColorValue;
    };
    new: {
      backgroundColor: ColorValue;
      borderColor: ColorValue;
    };
  };
};

/** Returns the common style used for CGN modules */
export const useCgnStyle = (): CgnStyleProps => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  // Solid color obtained from 20% opacity of hanPurple-250,
  // because you can't use `rgba` values in the `HeaderSecondLevel` component
  const hanPurple250_20 = "#343141";

  return {
    module: {
      default: {
        borderColor: IOColorsLegacy[theme["cardBorder-default"]],
        backgroundColor: IOColorsLegacy[theme["appBackground-secondary"]]
      },
      new: {
        borderColor:
          themeType === "light"
            ? IOColorsLegacy["hanPurple-250"]
            : hexToRgba(IOColorsLegacy["hanPurple-250"], 0.35),
        backgroundColor:
          themeType === "light"
            ? IOColorsLegacy["hanPurple-50"]
            : hexToRgba(IOColorsLegacy["hanPurple-250"], 0.2)
      }
    },
    header: {
      default: {
        backgroundColor: IOColorsLegacy[theme["appBackground-secondary"]],
        foreground: theme["textHeading-default"]
      },
      new: {
        backgroundColor:
          themeType === "light"
            ? IOColorsLegacy["hanPurple-50"]
            : hanPurple250_20,
        foreground: theme["textHeading-default"]
      }
    }
  };
};
