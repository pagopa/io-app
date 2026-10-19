import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

/** Debug info shown by a login error screen, whatever the failure was. */
export type FailureData = LoginFailureData | WebViewFailureData;

/**
 * Details of a login error: the failure `reason`, also sent to analytics, plus
 * any detail that helps to understand it (e.g. `url`), shown only in debug
 * mode.
 */
export type LoginFailureData = Record<string, unknown> & { reason: string };

/**
 * Details of a login WebView error, shown only in debug mode: the native error
 * `code` and `description`, which tell what went wrong (e.g. no connection).
 */
export type WebViewFailureData = {
  code: number;
  description: string;
  url: string;
};

/** Debug info of a login the user cancelled before it could fail or succeed. */
export const CANCELLED_LOGIN_FAILURE_DATA: LoginFailureData = {
  reason: "Login cancelled by the user"
};

/** Builds the debug info of a login WebView error from its native event. */
export const getWebViewFailureData = ({
  nativeEvent
}: WebViewErrorEvent | WebViewHttpErrorEvent): WebViewFailureData =>
  "statusCode" in nativeEvent
    ? {
        description: `Unexpected HTTP status ${nativeEvent.statusCode}`,
        code: nativeEvent.statusCode,
        url: nativeEvent.url
      }
    : {
        description: nativeEvent.description,
        code: nativeEvent.code,
        url: nativeEvent.url
      };
