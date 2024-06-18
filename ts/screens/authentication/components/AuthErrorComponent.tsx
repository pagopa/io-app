import React, { useMemo } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "../UnlockAccessComponent";

type Props = {
  errorCode?: string;
  onRetry: () => void;
  onCancel: () => void;
} & UnlockAccessProps;

const AuthErrorComponent = ({
  errorCode = "generic",
  authLevel,
  onRetry,
  onCancel
}: Props) => {
  const footerWithCloseButton = useMemo(
    () => ({
      action: {
        onPress: onCancel,
        label: I18n.t("global.buttons.close")
      }
    }),
    [onCancel]
  );
  const footerWithCloseAndRetryButtons = useMemo(
    () => ({
      action: {
        onPress: onRetry,
        label: I18n.t("global.buttons.retry")
      },
      secondaryAction: {
        onPress: onCancel,
        label: I18n.t("global.buttons.close")
      }
    }),
    [onCancel, onRetry]
  );

  const errorsObject: {
    [key: string]: OperationResultScreenContentProps;
  } = useMemo(
    () => ({
      "19": {
        pictogram: "passcode",
        title: I18n.t("authentication.auth_errors.error_19.title"),
        subtitle: I18n.t("authentication.auth_errors.error_19.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      "20": {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_20.title"),
        subtitle: I18n.t("authentication.auth_errors.error_20.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      "21": {
        pictogram: "time",
        title: I18n.t("authentication.auth_errors.error_21.title"),
        subtitle: I18n.t("authentication.auth_errors.error_21.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      "22": {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_22.title"),
        subtitle: I18n.t("authentication.auth_errors.error_22.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      "23": {
        pictogram: "attention",
        title: I18n.t("authentication.auth_errors.error_23.title"),
        subtitle: I18n.t("authentication.auth_errors.error_23.subtitle"),
        ...footerWithCloseButton
      },
      "25": {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      "1001": {
        pictogram: "identityCheck",
        title: I18n.t("authentication.auth_errors.error_1001.title"),
        subtitle: I18n.t("authentication.auth_errors.error_1001.subtitle"),
        ...footerWithCloseButton
      },
      generic: {
        pictogram: "umbrellaNew",
        title: I18n.t("authentication.auth_errors.generic.title"),
        subtitle: I18n.t("authentication.auth_errors.generic.subtitle"),
        ...footerWithCloseAndRetryButtons
      }
    }),
    [footerWithCloseAndRetryButtons, footerWithCloseButton]
  );

  const errorDetails = errorsObject[errorCode] || errorsObject.generic;

  return errorCode === "1002" ? (
    <UnlockAccessComponent authLevel={authLevel} />
  ) : (
    <OperationResultScreenContent {...errorDetails} />
  );
};

export default AuthErrorComponent;
