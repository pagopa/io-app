import { CieError, NfcError } from "@pagopa/io-react-native-cie";
import { CieInput } from "./input";

// Custom error for webview
type WebViewError = {
  name: "WEBVIEW_ERROR";
  message: string;
};

export type CieContext = {
  /**
   * The PIN code for the CIE card.
   */
  pin: string;
  /**
   * The URL from which obtain the service provider url and complete the flow.
   */
  authenticationUrl: string;
  /**
   * Wether the screen reader is enabled or not.
   */
  isScreenReaderEnabled: boolean;
  /**
   * The URL for authentication. It is used as service provider for the CIE authentication.
   */
  serviceProviderUrl: string | undefined;
  /**
   * The progress of the CIE reading process, represented as a value from 0 to 1.
   * It is undefined when the reading process has not started or has completed.
   */
  readProgress: number | undefined;
  /**
   * The URL for authorization, which is set after a successful CIE read.
   */
  authorizationUrl: string | undefined;
  /**
   * Redirect url after the authentication authorization
   */
  redirectUrl: string | undefined;
  /**
   * Error during CIE manager initialization, CIE read or webviews load
   */
  failure: CieError | NfcError | WebViewError | undefined;
};

export const getInitialContext = (input: CieInput): CieContext => ({
  pin: input.pin,
  authenticationUrl: input.authenticationUrl,
  isScreenReaderEnabled: input.isScreenReaderEnabled,
  serviceProviderUrl: undefined,
  readProgress: undefined,
  authorizationUrl: undefined,
  redirectUrl: undefined,
  failure: undefined
});
