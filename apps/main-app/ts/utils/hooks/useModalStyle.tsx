import { IOColorsLegacy, useIOColors, useIOTheme } from "@io-app/design-system";
import { ColorValue } from "react-native";

type ModalStyleProps = {
  backdrop: {
    /* Translucent: apply it at full opacity */
    backgroundColor: ColorValue;
  };
  modal: {
    backgroundColor: ColorValue;
  };
};

/** Returns the common style used for modals */
export const useModalStyle = (): ModalStyleProps => {
  const colors = useIOColors();
  const theme = useIOTheme();

  return {
    backdrop: {
      backgroundColor: colors.background.overlay
    },
    modal: {
      backgroundColor: IOColorsLegacy[theme["appBackground-primary"]]
    }
  };
};
