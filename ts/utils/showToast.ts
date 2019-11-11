import { Toast } from "native-base";

type Type = "danger" | "success" | "warning";

type ToastPosition = "top" | "bottom" | "center";

export const showToast = (
  text: string,
  type: Type = "danger",
  position: ToastPosition = "bottom",
  onClose?: () => void
) =>
  Toast.show({
    text,
    type,
    duration: 5000,
    buttonText: "✕",
    buttonTextStyle: {
      fontSize: 18
    },
    buttonStyle: {
      backgroundColor: "transparent"
    },
    position,
    onClose
  });
