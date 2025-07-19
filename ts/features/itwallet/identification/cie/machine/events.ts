import { NfcError, NfcEvent } from "@pagopa/io-react-native-cie";

/**
 * Event dispatched when the service provider url is fetched with the authentication url provided
 * After this event, the machine can start the authentication flow with CIE SDK
 */
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
 * Event that can be emitted by the CIE webviews
 */
type WebViewError = {
  type: "webview-error";
  message: string;
};

/**
 * Restarts the machine
 */
type Retry = {
  type: "retry";
};

export type CieEvents =
  | SetServiceProviderUrl
  | CieReadEvent
  | CieReadError
  | CieReadSuccess
  | CompleteAuthentication
  | WebViewError
  | Retry;
