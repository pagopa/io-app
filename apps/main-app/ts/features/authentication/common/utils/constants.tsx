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
  CERTIFICATE_EXPIRED: I18n.t("authentication.cie.card.error.generic"),
  CERTIFICATE_REVOKED: I18n.t("authentication.cie.card.error.generic"),
  EXTENDED_APDU_NOT_SUPPORTED: I18n.t(
    "authentication.cie.nfc.apduNotSupported"
  ),
  ON_CARD_PIN_LOCKED: I18n.t("authentication.cie.card.error.generic"),
  ON_NO_INTERNET_CONNECTION: I18n.t("authentication.cie.card.error.tryAgain"),
  ON_PIN_ERROR: I18n.t("authentication.cie.card.error.tryAgain"),
  ON_TAG_DISCOVERED_NOT_CIE: I18n.t(
    "authentication.cie.card.error.unknownCardContent"
  ),
  ON_TAG_LOST: I18n.t("authentication.cie.card.error.onTagLost"),
  "PIN Locked": I18n.t("authentication.cie.card.error.generic"),
  TAG_ERROR_NFC_NOT_SUPPORTED: I18n.t(
    "authentication.cie.card.error.unknownCardContent"
  ),
  // Reading interrupted before the sdk completes the reading
  "Transmission Error": I18n.t("authentication.cie.card.error.onTagLost")
};
