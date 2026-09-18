import I18n from "i18next";
import { useMemo } from "react";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { DifferentCFErrorScreen } from "../../activeSessionLogin/screens/DifferentCFErrorScreen";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "../../login/unlockAccess/components/UnlockAccessComponent";
import { AUTH_ERRORS, getAuthErrorDetails } from "../utils/authError";

export type AuthErrorComponentProps = UnlockAccessProps & {
  errorCodeOrMessage?: string;
  onCancel: () => void;
  onRetry: () => void;
};

const AuthErrorComponent = ({
  errorCodeOrMessage = AUTH_ERRORS.GENERIC_ERROR,
  authLevel,
  onRetry,
  onCancel
}: AuthErrorComponentProps) => {
  const footerWithCloseButton = useMemo(
    () => ({
      action: {
        onPress: onCancel,
        label: I18n.t("global.buttons.close"),
        testID: "single-cancel-button-test-id"
      }
    }),
    [onCancel]
  );
  const footerWithCloseAndRetryButtons = useMemo(
    () => ({
      action: {
        onPress: onRetry,
        label: I18n.t("global.buttons.retry"),
        testID: "retry-button-test-id"
      },
      secondaryAction: {
        onPress: onCancel,
        label: I18n.t("global.buttons.close"),
        testID: "cancel-button-test-id"
      }
    }),
    [onCancel, onRetry]
  );

  const errorDetails: OperationResultScreenContentProps = useMemo(() => {
    const { pictogram, title, subtitle } =
      getAuthErrorDetails(errorCodeOrMessage);
    const footer =
      errorCodeOrMessage === AUTH_ERRORS.ERROR_23 ||
      errorCodeOrMessage === AUTH_ERRORS.ERROR_1001
        ? footerWithCloseButton
        : footerWithCloseAndRetryButtons;

    return {
      pictogram,
      title,
      subtitle,
      ...footer
    };
  }, [
    errorCodeOrMessage,
    footerWithCloseAndRetryButtons,
    footerWithCloseButton
  ]);

  switch (errorCodeOrMessage) {
    case AUTH_ERRORS.ERROR_1002:
      return <UnlockAccessComponent authLevel={authLevel} />;
    case AUTH_ERRORS.ERROR_1004:
      return <DifferentCFErrorScreen />;
    default:
      return <OperationResultScreenContent {...errorDetails} />;
  }
};

export default AuthErrorComponent;
