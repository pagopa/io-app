import { IOPictograms } from "@io-app/design-system";
import I18n from "i18next";

import { IOAnimatedPictograms } from "../../../../components/ui/AnimatedPictogram";

export enum AUTH_ERRORS {
  CIEID_IOS_INVALID_OPERATION_MESSAGE = "Operazione_non_valida",
  CIEID_IOS_OPERATION_CANCELED_MESSAGE = "Operazione_annullata_dall'utente",
  CIEID_OPERATION_CANCEL = "CIEID_OPERATION_CANCEL",
  ERROR_19 = "19",
  ERROR_20 = "20",
  ERROR_21 = "21",
  ERROR_22 = "22",
  ERROR_23 = "23",
  ERROR_25 = "25",
  ERROR_1001 = "1001", // This error is tracked as generic error
  ERROR_1002 = "1002", // This error is tracked as generic error
  ERROR_1004 = "1004", // active session login - different fiscal code
  GENERIC_ERROR = "GENERIC_ERROR",
  MISSING_IDP_ISSUER = "Error: Missing idpIssuer inside configuration", // This error is tracked as generic error
  MISSING_SAML_RESPONSE = "Missing SAMLResponse in ACS"
}

export type AuthErrorDetails = {
  pictogram: IOAnimatedPictograms | IOPictograms;
  subtitle: string;
  title: string;
};

/**
 * Maps each auth error code to its pictogram and already-translated
 * title/subtitle. Built with literal `I18n.t` calls (rather than resolving
 * a dynamic key) so `tsc` and the i18n lint rules can see every key.
 */
const getAuthErrorDetailsMap = (): { [key: string]: AuthErrorDetails } => ({
  [AUTH_ERRORS.ERROR_19]: {
    pictogram: "passcode",
    title: I18n.t("authentication.auth_errors.error_19.title"),
    subtitle: I18n.t("authentication.auth_errors.error_19.subtitle")
  },
  [AUTH_ERRORS.ERROR_20]: {
    pictogram: "accessDenied",
    title: I18n.t("authentication.auth_errors.error_20.title"),
    subtitle: I18n.t("authentication.auth_errors.error_20.subtitle")
  },
  [AUTH_ERRORS.ERROR_21]: {
    pictogram: "time",
    title: I18n.t("authentication.auth_errors.error_21.title"),
    subtitle: I18n.t("authentication.auth_errors.error_21.subtitle")
  },
  [AUTH_ERRORS.ERROR_22]: {
    pictogram: "accessDenied",
    title: I18n.t("authentication.auth_errors.error_22.title"),
    subtitle: I18n.t("authentication.auth_errors.error_22.subtitle")
  },
  [AUTH_ERRORS.ERROR_23]: {
    pictogram: "attention",
    title: I18n.t("authentication.auth_errors.error_23.title"),
    subtitle: I18n.t("authentication.auth_errors.error_23.subtitle")
  },
  [AUTH_ERRORS.ERROR_25]: {
    pictogram: "accessDenied",
    title: I18n.t("authentication.auth_errors.error_25.title"),
    subtitle: I18n.t("authentication.auth_errors.error_25.subtitle")
  },
  [AUTH_ERRORS.ERROR_1001]: {
    pictogram: "identityCheck",
    title: I18n.t("authentication.auth_errors.error_1001.title"),
    subtitle: I18n.t("authentication.auth_errors.error_1001.subtitle")
  },
  [AUTH_ERRORS.CIEID_OPERATION_CANCEL]: {
    pictogram: "accessDenied",
    title: I18n.t("authentication.auth_errors.error_25.title"),
    subtitle: I18n.t("authentication.auth_errors.error_25.subtitle")
  },
  [AUTH_ERRORS.CIEID_IOS_OPERATION_CANCELED_MESSAGE]: {
    pictogram: "accessDenied",
    title: I18n.t("authentication.auth_errors.error_25.title"),
    subtitle: I18n.t("authentication.auth_errors.error_25.subtitle")
  },
  [AUTH_ERRORS.CIEID_IOS_INVALID_OPERATION_MESSAGE]: {
    pictogram: "umbrella",
    title: I18n.t("authentication.auth_errors.generic.title"),
    subtitle: I18n.t("authentication.auth_errors.generic.subtitle")
  },
  [AUTH_ERRORS.MISSING_SAML_RESPONSE]: {
    pictogram: "accessDenied",
    title: I18n.t("authentication.auth_errors.missing_saml_response.title"),
    subtitle: I18n.t(
      "authentication.auth_errors.missing_saml_response.subtitle"
    )
  },
  [AUTH_ERRORS.GENERIC_ERROR]: {
    pictogram: "umbrella",
    title: I18n.t("authentication.auth_errors.generic.title"),
    subtitle: I18n.t("authentication.auth_errors.generic.subtitle")
  }
});

/**
 * Retrieves the pictogram and translated title/subtitle for an auth error
 * code, falling back to the generic error entry when the code is unknown
 * or missing.
 */
export const getAuthErrorDetails = (
  errorCodeOrMessage?: string
): AuthErrorDetails => {
  const detailsByError = getAuthErrorDetailsMap();

  return (
    (errorCodeOrMessage !== undefined
      ? detailsByError[errorCodeOrMessage]
      : undefined) ?? detailsByError[AUTH_ERRORS.GENERIC_ERROR]
  );
};
