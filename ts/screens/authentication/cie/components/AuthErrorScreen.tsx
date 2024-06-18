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
  const errorsObject: {
    [key: string]: OperationResultScreenContentProps;
  } = {
    "22": {
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
    },
    "1001": {
      pictogram: "identityCheck",
      title: I18n.t("authentication.cie_errors.error_1001.title"),
      subtitle: I18n.t("authentication.cie_errors.error_1001.subtitle"),
      action: {
        onPress: onCancel,
        label: I18n.t("global.buttons.close")
      }
    },
    generic: {
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
    }
  };

  const errorDetails = errorsObject[errorCode] || errorsObject.generic;

  return <OperationResultScreenContent {...errorDetails} />;
};

export default AuthErrorScreen;
