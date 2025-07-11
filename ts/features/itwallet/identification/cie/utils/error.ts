import { NfcError } from "@pagopa/io-react-native-cie";

// Custom error for webview
export type WebViewError = {
  name: "WEBVIEW_ERROR";
  message: string;
};

// Utiltiy that verifies if the failure is an NfcError
export const isNfcError = (
  failure: unknown
): failure is NfcError | WebViewError =>
  failure !== null &&
  failure !== undefined &&
  typeof failure === "object" &&
  "name" in failure;
