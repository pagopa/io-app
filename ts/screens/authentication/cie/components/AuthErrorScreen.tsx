/* eslint-disable no-console */
import React, { useState } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

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
  const defaultInfoValues: OperationResultScreenContentProps = {
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

  const [info, setInfo] =
    useState<OperationResultScreenContentProps>(defaultInfoValues);
  useOnFirstRender(() => {
    switch (errorCode) {
      case "22":
        setInfo({
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
        });
        break;
      case "1001":
        setInfo({
          pictogram: "identityCheck",
          title: I18n.t("authentication.cie_errors.error_1001.title"),
          subtitle: I18n.t("authentication.cie_errors.error_1001.subtitle"),
          action: {
            onPress: onRetry,
            label: I18n.t("global.buttons.retry")
          }
        });
        break;
      default:
        setInfo(defaultInfoValues);
        break;
    }
  });

  return <OperationResultScreenContent {...info} />;
};

export default AuthErrorScreen;
