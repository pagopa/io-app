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
import { getAuthErrorKey, LoginFailure } from "../utils/loginFailure";

export type AuthErrorComponentProps = UnlockAccessProps & {
  /** The login failure, which selects the content. Generic content if missing. */
  failure?: LoginFailure;
  onCancel: () => void;
  onRetry: () => void;
};

const AuthErrorComponent = ({
  failure,
  authLevel,
  onRetry,
  onCancel
}: AuthErrorComponentProps) => {
  const authErrorKey =
    (failure && getAuthErrorKey(failure)) ?? AUTH_ERRORS.GENERIC_ERROR;

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
    const { pictogram, title, subtitle } = getAuthErrorDetails(authErrorKey);
    const footer =
      authErrorKey === AUTH_ERRORS.ERROR_23 ||
      authErrorKey === AUTH_ERRORS.ERROR_1001
        ? footerWithCloseButton
        : footerWithCloseAndRetryButtons;

    return {
      pictogram,
      title,
      subtitle,
      ...footer
    };
  }, [authErrorKey, footerWithCloseAndRetryButtons, footerWithCloseButton]);

  switch (authErrorKey) {
    case AUTH_ERRORS.ERROR_1002:
      return <UnlockAccessComponent authLevel={authLevel} />;
    case AUTH_ERRORS.ERROR_1004:
      return <DifferentCFErrorScreen />;
    default:
      return <OperationResultScreenContent {...errorDetails} />;
  }
};

export default AuthErrorComponent;
