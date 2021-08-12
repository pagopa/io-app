import { Toast } from "native-base";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";

type Type = "danger" | "success" | "warning";
type ToastPosition = "top" | "bottom" | "center";

const styles = StyleSheet.create({
  warningColor: {
    backgroundColor: customVariables.toastColor
  },
  warningTextColor: {
    color: customVariables.textColor
  },
  buttonTextStyle: {
    fontSize: 18
  }
});

export const showToast = (
  text: string,
  type: Type = "danger",
  position: ToastPosition = "bottom"
) => {
  // The warning type is customized
  const style = type === "warning" ? styles.warningColor : undefined;
  const textStyle = type === "warning" ? styles.warningTextColor : undefined;
  const buttonTextStyle =
    type === "warning"
      ? [styles.buttonTextStyle, styles.warningTextColor]
      : styles.buttonTextStyle;

  return Toast.show({
    text,
    type,
    duration: 5000,
    buttonText: "✕",
    buttonTextStyle,
    buttonStyle: {
      backgroundColor: "transparent"
    },
    position,
    textStyle,
    style
  });
};
