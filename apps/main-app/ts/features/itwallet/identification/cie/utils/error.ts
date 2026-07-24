import { NfcError } from "@pagopa/io-react-native-cie";

// Custom error for webview
export type WebViewError = {
  message: string;
  name: "WEBVIEW_ERROR";
};

// Utiltiy that verifies if the failure is an NfcError
export const isNfcError = (
  failure: unknown
): failure is NfcError | WebViewError =>
  failure !== null &&
  failure !== undefined &&
  typeof failure === "object" &&
  "name" in failure;
