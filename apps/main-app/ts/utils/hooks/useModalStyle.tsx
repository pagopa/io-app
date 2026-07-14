import { IOColors, useIOTheme, useIOThemeContext } from "@io-app/design-system";
import { ColorValue, ViewStyle } from "react-native";

type ModalStyleProps = {
  backdrop: {
    backgroundColor: ColorValue;
    opacity: number;
  };
  modal: {
    backgroundColor: ColorValue;
  };
};

/**
 * Returns the common style used for modals
 */
export const useModalStyle = (): ModalStyleProps => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  const backdropOpacity: ViewStyle["opacity"] =
    themeType === "light" ? 0.15 : 0.7;

  return {
    backdrop: {
      opacity: backdropOpacity,
      backgroundColor: IOColors.black
    },
    modal: {
      backgroundColor: IOColors[theme["appBackground-primary"]]
    }
  };
};
