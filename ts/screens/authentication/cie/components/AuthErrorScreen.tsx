/* eslint-disable no-console */
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";

type Props = {
  errorCode?: string;
  onRetry: () => void;
  onCancel: () => void;
};

const AuthErrorScreen = ({
  errorCode = "generic",
  onRetry,
  onCancel
}: Props) => {
  const renderError = (): OperationResultScreenContentProps => {
    switch (errorCode) {
      case "22":
        return {
          pictogram: "accessDenied",
          title: I18n.t("authentication.cie_errors.error_22.title"),
          subtitle: I18n.t("authentication.cie_errors.error_22.subtitle"),
          action: {
            onPress: onRetry,
            label: I18n.t("global.buttons.retry")
          },
          secondaryAction: {
            onPress: onCancel,
            label: I18n.t("global.buttons.close")
          }
        };
      case "1001":
        return {
          pictogram: "identityCheck",
          title: I18n.t("authentication.cie_errors.error_1001.title"),
          subtitle: I18n.t("authentication.cie_errors.error_1001.subtitle"),
          action: {
            onPress: onRetry,
            label: I18n.t("global.buttons.retry")
          }
        };
      default:
        return {
          pictogram: "umbrellaNew",
          title: I18n.t("authentication.cie_errors.generic.title"),
          subtitle: I18n.t("authentication.cie_errors.generic.subtitle"),
          action: {
            onPress: onRetry,
            label: I18n.t("global.buttons.retry")
          },
          secondaryAction: {
            onPress: onCancel,
            label: I18n.t("global.buttons.close")
          }
        };
    }
  };

  return <OperationResultScreenContent {...renderError()} />;
};

export default AuthErrorScreen;
