import {
  Body,
  hexToRgba,
  IOColors,
  IOVisualCostants
} from "@io-app/design-system";
import { StyleSheet, View } from "react-native";

import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import { useModalStyle } from "../../utils/hooks/useModalStyle";
import { AlertModalOverlay } from "./AlertModalOverlay";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "auto",
    width: "auto",
    padding: IOVisualCostants.appMarginDefault,
    marginHorizontal: IOVisualCostants.appMarginDefault,
    borderCurve: "continuous",
    borderRadius: 16
  }
});

type AlertModalProps = Readonly<{
  message: string;
}>;

/**
 * A custom alert to show a message
 */
export const AlertModal = ({ message }: AlertModalProps) => {
  useHardwareBackButton(() => true);

  const { backdrop, modal } = useModalStyle();

  return (
    <AlertModalOverlay
      backgroundColor={backdrop.backgroundColor}
      foreground={
        <View
          style={[
            styles.container,
            {
              backgroundColor: modal.backgroundColor,
              borderWidth: 1,
              borderColor: hexToRgba(IOColors.white, 0.1)
            }
          ]}
        >
          <Body>{message}</Body>
        </View>
      }
      opacity={backdrop.opacity}
    />
  );
};
