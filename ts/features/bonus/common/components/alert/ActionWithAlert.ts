import { IOToast } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";

type ConfirmConfig = {
  title: string;
  body?: string;
  confirmText: string;
  cancelText: string;
  onConfirmAction: () => void;
  // optional, in case will show a toast with the feedback text when the action is executed
  completedFeedbackText?: string;
};
/**
 * A generic way to ask confirmation with {@link Alert.alert} for a specific action
 * @param confirmConfig
 */
export const actionWithAlert = (confirmConfig: ConfirmConfig) => {
  Alert.alert(
    confirmConfig.title,
    confirmConfig.body ?? "",
    [
      {
        text: confirmConfig.cancelText
      },
      {
        text: confirmConfig.confirmText,
        onPress: () => {
          confirmConfig.onConfirmAction();
          if (confirmConfig.completedFeedbackText) {
            IOToast.success(confirmConfig.completedFeedbackText);
          }
        },
        style: "cancel"
      }
    ],
    { cancelable: true }
  );
};
