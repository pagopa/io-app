import { Alert } from "react-native";
import I18n from "../../../i18n";
import { showToast } from "../../../utils/showToast";

type ConfirmConfig = {
  title: string;
  body?: string;
  confirmText: string;
  cancelText: string;
  onConfirmAction: () => void;
  completedFeedbackText?: string;
};

export const actionWithAlert = (confirmConfig: ConfirmConfig) => {
  Alert.alert(
    confirmConfig.title,
    confirmConfig.body ? confirmConfig.body : "",
    [
      {
        text: confirmConfig.confirmText,
        onPress: () => {
          confirmConfig.onConfirmAction();
          if (confirmConfig.completedFeedbackText) {
            showToast(confirmConfig.completedFeedbackText, "success");
          }
        },
        style: "cancel"
      },
      {
        text: confirmConfig.cancelText
      }
    ]
  );
};

export const abortBonusRequest = (onAbort: () => void) =>
  actionWithAlert({
    title: I18n.t("bonus.bonusVacanza.abort.title"),
    body: I18n.t("bonus.bonusVacanza.abort.body"),
    confirmText: I18n.t("bonus.bonusVacanza.abort.confirm"),
    cancelText: I18n.t("bonus.bonusVacanza.abort.cancel"),
    completedFeedbackText: I18n.t("bonus.bonusVacanza.abort.completed"),
    onConfirmAction: onAbort
  });
