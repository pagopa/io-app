import { NfcError } from "@pagopa/io-react-native-cie";
import z from "zod";

// Custom error for webview
export const webViewError = z.object({
  name: z.literal("WEBVIEW_ERROR"),
  message: z.string()
});
export type WebViewError = z.output<typeof webViewError>;

// Utiltiy that verifies if the failure is an NfcError
export const isNfcError = (
  failure: unknown
): failure is NfcError | WebViewError =>
  failure !== null &&
  failure !== undefined &&
  typeof failure === "object" &&
  "name" in failure;
