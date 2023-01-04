import { Alert } from "react-native";
import { showToast } from "../../../../../utils/showToast";

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
    confirmConfig.body ? confirmConfig.body : "",
    [
      {
        text: confirmConfig.cancelText
      },
      {
        text: confirmConfig.confirmText,
        onPress: () => {
          confirmConfig.onConfirmAction();
          if (confirmConfig.completedFeedbackText) {
            showToast(confirmConfig.completedFeedbackText, "success");
          }
        },
        style: "cancel"
      }
    ],
    { cancelable: true }
  );
};
