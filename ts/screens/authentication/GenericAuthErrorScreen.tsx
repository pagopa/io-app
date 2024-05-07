/* eslint-disable no-console */
import React, { useState } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../components/screens/OperationResultScreenContent";
import I18n from "../../i18n";

type Props = {
  errorCode: "22" | "1001" | "generic";
};

const GenericAuthErrorScreen = ({ errorCode = "generic" }: Props) => {
  const defaultInfoValues: OperationResultScreenContentProps = {
    pictogram: "umbrella",
    title: I18n.t("authentication.cie_errors.generic.title"),
    subtitle: I18n.t("authentication.cie_errors.generic.subtitle"),
    action: {
      onPress: () => console.log("primary generic"),
      label: I18n.t("global.buttons.retry")
    },
    secondaryAction: {
      onPress: () => console.log("secondary generic"),
      label: I18n.t("global.buttons.close")
    }
  };

  const [info, setInfo] =
    useState<OperationResultScreenContentProps>(defaultInfoValues);

  switch (errorCode) {
    case "22":
      setInfo({
        pictogram: "accessDenied",
        title: I18n.t("authentication.cie_errors.error_22.title"),
        subtitle: I18n.t("authentication.cie_errors.error_22.subtitle"),
        action: {
          onPress: () => console.log("primary 22"),
          label: I18n.t("global.buttons.retry")
        },
        secondaryAction: {
          onPress: () => console.log("secondary 22"),
          label: I18n.t("global.buttons.close")
        }
      });
      return;
    case "1001":
      setInfo({
        pictogram: "identityCheck",
        title: I18n.t("authentication.cie_errors.error_1001.title"),
        subtitle: I18n.t("authentication.cie_errors.error_1001.subtitle"),
        action: {
          onPress: () => console.log("primary 1001"),
          label: I18n.t("global.buttons.retry")
        }
      });
      return;
    default:
      setInfo(defaultInfoValues);
  }

  return <OperationResultScreenContent {...info} />;
};

export default GenericAuthErrorScreen;
