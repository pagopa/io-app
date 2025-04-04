import {
  hexToRgba,
  IOColors,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ColorValue } from "react-native";

type CgnStyleProps = {
  module: {
    default: {
      borderColor: ColorValue;
      backgroundColor: ColorValue;
    };
    new: {
      borderColor: ColorValue;
      backgroundColor: ColorValue;
    };
  };
  header: {
    // It should be `ColorValue`, but we need to adapt the `useHeaderSecondLevel` hook first
    default: {
      backgroundColor: string;
      foreground: IOColors;
    };
    new: {
      backgroundColor: string;
      foreground: IOColors;
    };
  };
};

/**
 * Returns the common style used for CGN modules
 */
export const useCgnStyle = (): CgnStyleProps => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  // Solid color obtained from 20% opacity of hanPurple-250,
  // because you can't use `rgba` values in the `HeaderSecondLevel` component
  const hanPurple250_20 = "#343141";

  return {
    module: {
      default: {
        borderColor:
          themeType === "light" ? IOColors["grey-100"] : IOColors["grey-850"],
        backgroundColor: IOColors[theme["appBackground-secondary"]]
      },
      new: {
        borderColor:
          themeType === "light"
            ? IOColors["hanPurple-250"]
            : hexToRgba(IOColors["hanPurple-250"], 0.35),
        backgroundColor:
          themeType === "light"
            ? IOColors["hanPurple-50"]
            : hexToRgba(IOColors["hanPurple-250"], 0.2)
      }
    },
    header: {
      default: {
        backgroundColor: IOColors[theme["appBackground-secondary"]],
        foreground: theme["textHeading-default"]
      },
      new: {
        backgroundColor:
          themeType === "light" ? IOColors["hanPurple-50"] : hanPurple250_20,
        foreground: theme["textHeading-default"]
      }
    }
  };
};
