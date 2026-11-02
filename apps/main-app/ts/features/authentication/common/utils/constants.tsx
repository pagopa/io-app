import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";

import { CieAuthenticationErrorReason } from "../../login/cie/store/actions";

export const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
export const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;
export const accessibityTimeout = 100 as Millisecond;

export const cieErrorMessagesMap: Partial<
  Record<CieAuthenticationErrorReason, string>
> = {
  AUTHENTICATION_ERROR: I18n.t("authentication.cie.card.error.generic"),
  APDU_ERROR: I18n.t("authentication.cie.nfc.apduNotSupported"),
  CARD_BLOCKED: I18n.t("authentication.cie.card.error.generic"),
  CERTIFICATE_EXPIRED: I18n.t("authentication.cie.card.error.generic"),
  CERTIFICATE_REVOKED: I18n.t("authentication.cie.card.error.generic"),
  GENERIC_ERROR: I18n.t("authentication.cie.card.error.generic"),
  NO_INTERNET_CONNECTION: I18n.t("authentication.cie.card.error.tryAgain"),
  NOT_A_CIE: I18n.t("authentication.cie.card.error.unknownCardContent"),
  TAG_LOST: I18n.t("authentication.cie.card.error.onTagLost"),
  WRONG_CAN: I18n.t("authentication.cie.card.error.tryAgain"),
  WRONG_PIN: I18n.t("authentication.cie.card.error.tryAgain")
};
