import { useMemo } from "react";
import I18n from "i18next";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "../../login/unlockAccess/components/UnlockAccessComponent";
import { DifferentCFErrorScreen } from "../../activeSessionLogin/screens/DifferentCFErrorScreen";

export enum AUTH_ERRORS {
  ERROR_19 = "19",
  ERROR_20 = "20",
  ERROR_21 = "21",
  ERROR_22 = "22",
  ERROR_23 = "23",
  ERROR_25 = "25",
  ERROR_1001 = "1001", // This error is tracked as generic error
  ERROR_1002 = "1002", // This error is tracked as generic error
  ERROR_1004 = "1004", // active session login - different fiscal code
  MISSING_SAML_RESPONSE = "Missing SAMLResponse in ACS",
  MISSING_IDP_ISSUER = "Error: Missing idpIssuer inside configuration", // This error is tracked as generic error
  CIEID_IOS_OPERATION_CANCELED_MESSAGE = "Operazione_annullata_dall'utente",
  CIEID_IOS_INVALID_OPERATION_MESSAGE = "Operazione_non_valida",
  CIEID_OPERATION_CANCEL = "CIEID_OPERATION_CANCEL",
  GENERIC_ERROR = "GENERIC_ERROR"
}

export type AuthErrorComponentProps = {
  errorCodeOrMessage?: string;
  onRetry: () => void;
  onCancel: () => void;
} & UnlockAccessProps;

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

  const errorsObject: {
    [key: string]: OperationResultScreenContentProps;
  } = useMemo(
    () => ({
      [AUTH_ERRORS.ERROR_19]: {
        pictogram: "passcode",
        title: I18n.t("authentication.auth_errors.error_19.title"),
        subtitle: I18n.t("authentication.auth_errors.error_19.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.ERROR_20]: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_20.title"),
        subtitle: I18n.t("authentication.auth_errors.error_20.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.ERROR_21]: {
        pictogram: "time",
        title: I18n.t("authentication.auth_errors.error_21.title"),
        subtitle: I18n.t("authentication.auth_errors.error_21.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.ERROR_22]: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_22.title"),
        subtitle: I18n.t("authentication.auth_errors.error_22.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.ERROR_23]: {
        pictogram: "attention",
        title: I18n.t("authentication.auth_errors.error_23.title"),
        subtitle: I18n.t("authentication.auth_errors.error_23.subtitle"),
        ...footerWithCloseButton
      },
      [AUTH_ERRORS.ERROR_25]: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.ERROR_1001]: {
        pictogram: "identityCheck",
        title: I18n.t("authentication.auth_errors.error_1001.title"),
        subtitle: I18n.t("authentication.auth_errors.error_1001.subtitle"),
        ...footerWithCloseButton
      },
      [AUTH_ERRORS.CIEID_OPERATION_CANCEL]: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.CIEID_IOS_OPERATION_CANCELED_MESSAGE]: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.CIEID_IOS_INVALID_OPERATION_MESSAGE]: {
        pictogram: "umbrella",
        title: I18n.t("authentication.auth_errors.generic.title"),
        subtitle: I18n.t("authentication.auth_errors.generic.subtitle"),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.MISSING_SAML_RESPONSE]: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.missing_saml_response.title"),
        subtitle: I18n.t(
          "authentication.auth_errors.missing_saml_response.subtitle"
        ),
        ...footerWithCloseAndRetryButtons
      },
      [AUTH_ERRORS.GENERIC_ERROR]: {
        pictogram: "umbrella",
        title: I18n.t("authentication.auth_errors.generic.title"),
        subtitle: I18n.t("authentication.auth_errors.generic.subtitle"),
        ...footerWithCloseAndRetryButtons
      }
    }),
    [footerWithCloseAndRetryButtons, footerWithCloseButton]
  );

  const errorDetails =
    errorsObject[errorCodeOrMessage] || errorsObject[AUTH_ERRORS.GENERIC_ERROR];

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
