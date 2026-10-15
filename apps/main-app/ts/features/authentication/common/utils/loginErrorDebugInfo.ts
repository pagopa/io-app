import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

/**
 * Details of a login error, shown only in debug mode: an explanatory `message`
 * plus any detail that helps to understand it (e.g. `code`, `url`).
 */
export type LoginErrorDebugInfo = Record<string, unknown> & { message: string };

/** Debug info of a login the user cancelled before it could fail or succeed. */
export const CANCELLED_LOGIN_DEBUG_INFO: LoginErrorDebugInfo = {
  message: "Login cancelled by the user"
};

/**
 * Builds the debug info of a login WebView error, keeping the native error code
 * and description, which tell what went wrong (e.g. no connection).
 */
export const getWebViewErrorDebugInfo = ({
  nativeEvent
}: WebViewErrorEvent | WebViewHttpErrorEvent): LoginErrorDebugInfo =>
  "statusCode" in nativeEvent
    ? {
        message: `Unexpected HTTP status ${nativeEvent.statusCode}`,
        code: nativeEvent.statusCode,
        url: nativeEvent.url
      }
    : {
        message: nativeEvent.description,
        code: nativeEvent.code,
        url: nativeEvent.url
      };
