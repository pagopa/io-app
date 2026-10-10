/** Native reading events preserved from the original io-cie-sdk bridge. */
export type CIEEvent =
  | "AUTHENTICATION_ERROR"
  | "CERTIFICATE_EXPIRED"
  | "CERTIFICATE_REVOKED"
  | "EXTENDED_APDU_NOT_SUPPORTED"
  | "ON_CARD_PIN_LOCKED"
  | "ON_NO_INTERNET_CONNECTION"
  | "ON_PIN_ERROR"
  | "ON_TAG_DISCOVERED"
  | "ON_TAG_DISCOVERED_NOT_CIE"
  | "ON_TAG_LOST"
  | "PIN_INPUT_ERROR"
  | "PIN Locked"
  | "START_NFC_ERROR"
  | "STOP_NFC_ERROR"
  | "TAG_ERROR_NFC_NOT_SUPPORTED"
  | "Transmission Error";

/** Reading event and last known remaining PIN attempts. */
export type Event = {
  attemptsLeft: number;
  event: CIEEvent;
};

/** Keys supported by the iOS NFC system alert. */
export type iOSAlertMessageKeys =
  | "cardLocked"
  | "genericError"
  | "invalidCard"
  | "moreTags"
  | "readingInProgress"
  | "readingInstructions"
  | "readingSuccess"
  | "tagLost"
  | "wrongPin1AttemptLeft"
  | "wrongPin2AttemptLeft";
