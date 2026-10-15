import { IOToast } from "@io-app/design-system";
import { Alert } from "react-native";

type ConfirmConfig = {
  body?: string;
  cancelText: string;
  // optional, in case will show a toast with the feedback text when the action is executed
  completedFeedbackText?: string;
  confirmText: string;
  onConfirmAction: () => void;
  title: string;
};
/**
 * A generic way to ask confirmation with {@link Alert.alert} for a specific
 * action
 *
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
