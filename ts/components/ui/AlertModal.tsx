import {
  Body,
  IOColors,
  IOVisualCostants,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import themeVariables from "../../theme/variables";
import { Overlay } from "./Overlay";

const opaqueBgColor = hexToRgba(IOColors.black, 0.6);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "auto",
    width: "auto",
    backgroundColor: IOColors.white,
    padding: themeVariables.contentPadding,
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

  return (
    <Overlay
      backgroundColor={opaqueBgColor}
      foreground={
        <View style={styles.container}>
          <Body color="bluegreyDark">{message}</Body>
        </View>
      }
    />
  );
};
