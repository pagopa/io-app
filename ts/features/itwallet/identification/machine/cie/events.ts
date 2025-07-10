import { NfcError, NfcEvent } from "@pagopa/io-react-native-cie";

type SetServiceProviderUrl = {
  type: "set-service-provider-url";
  url: string;
};

/**
 * Events emitted by the CieManager during the reading process.
 * It containes the progress of the reading proicess
 */
type CieReadEvent = {
  type: "cie-read-event";
  event: NfcEvent;
};

/**
 * Events emitted by the CieManager when an error occurs during the reading process.
 * It contains the error details.
 */
type CieReadError = {
  type: "cie-read-error";
  error: NfcError;
};

/**
 * Events emitted by the CieManager when the reading process is successful.
 * It contains the authorization URL to be used for further actions.
 */
type CieReadSuccess = {
  type: "cie-read-success";
  authorizationUrl: string;
};

/**
 * Event emitted when the user complete the authentication by authorizing it
 */
type CompleteAuthentication = {
  type: "complete-authentication";
  redirectUrl: string;
};

/**
 * Restarts the machine
 */
type Retry = {
  type: "retry";
};

/**
 * Closes the authentication
 */
type Close = {
  type: "close";
};

export type CieEvents =
  | SetServiceProviderUrl
  | CieReadEvent
  | CieReadError
  | CieReadSuccess
  | CompleteAuthentication
  | Retry
  | Close;
