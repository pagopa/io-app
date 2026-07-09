import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { Platform } from "react-native";

import { ReadingState } from "../../../login/cie/components/CieCardReadingAnimation";
import { CieAuthenticationErrorReason } from "../../../login/cie/store/actions/cie";

// the timeout we sleep until move to consent form screen when authentication goes well
export const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
export const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;
export const accessibityTimeout = 100 as Millisecond;

// A subset of Cie Events (errors) which is of interest to analytics
export const analyticActions = new Map<CieAuthenticationErrorReason, string>([
  ["AUTHENTICATION_ERROR", I18n.t("authentication.cie.card.error.generic")],
  ["CERTIFICATE_EXPIRED", I18n.t("authentication.cie.card.error.generic")],
  ["CERTIFICATE_REVOKED", I18n.t("authentication.cie.card.error.generic")],
  [
    "EXTENDED_APDU_NOT_SUPPORTED",
    I18n.t("authentication.cie.nfc.apduNotSupported")
  ],
  ["ON_CARD_PIN_LOCKED", I18n.t("authentication.cie.card.error.generic")],
  [
    "ON_NO_INTERNET_CONNECTION",
    I18n.t("authentication.cie.card.error.tryAgain")
  ],
  ["ON_PIN_ERROR", I18n.t("authentication.cie.card.error.tryAgain")],
  [
    "ON_TAG_DISCOVERED_NOT_CIE",
    I18n.t("authentication.cie.card.error.unknownCardContent")
  ],
  ["ON_TAG_LOST", I18n.t("authentication.cie.card.error.onTagLost")],
  ["PIN_INPUT_ERROR", ""],
  ["PIN Locked", I18n.t("authentication.cie.card.error.generic")],
  ["START_NFC_ERROR", ""],
  ["STOP_NFC_ERROR", ""],
  [
    "TAG_ERROR_NFC_NOT_SUPPORTED",
    I18n.t("authentication.cie.card.error.unknownCardContent")
  ],
  // Reading interrupted before the sdk complete the reading
  ["Transmission Error", I18n.t("authentication.cie.card.error.onTagLost")]
]);

export type TextForState = {
  content: string;
  subtitle?: string;
  title: string;
};

// some texts changes depending on current running Platform
export const getTextForState = (
  state: ReadingState.error | ReadingState.waiting_card,
  errorMessage = ""
): TextForState => {
  const texts: Record<
    ReadingState.error | ReadingState.waiting_card,
    TextForState
  > = Platform.select({
    ios: {
      [ReadingState.waiting_card]: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        // the native alert hides the screen content and shows a message it self
        content: ""
      },
      [ReadingState.error]: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: "",
        // the native alert hides the screen content and shows a message it self
        content: ""
      },
      [ReadingState.reading]: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        // the native alert hides the screen content and shows a message it self
        content: ""
      }
    },
    default: {
      [ReadingState.waiting_card]: {
        title: I18n.t("authentication.cie.card.title"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
        content: I18n.t("authentication.cie.card.layCardMessageFooter")
      },
      [ReadingState.error]: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: I18n.t("authentication.cie.card.error.onTagLost"),
        content: errorMessage
      }
    }
  });
  return texts[state];
};

export const ACS_PATH = "/assertionConsumerService";
