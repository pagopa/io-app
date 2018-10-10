import { Toast } from "native-base";

type Type = "danger" | "success" | "warning";

export const showToast = (text: string, type: Type = "danger") =>
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
    }
  });
