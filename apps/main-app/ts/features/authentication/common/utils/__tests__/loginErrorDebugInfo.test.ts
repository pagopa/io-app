import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import { getWebViewErrorDebugInfo } from "../loginErrorDebugInfo";

describe("getWebViewErrorDebugInfo", () => {
  test.each([
    {
      name: "a WebView error",
      event: {
        nativeEvent: {
          url: "https://example.com",
          code: -2,
          description: "net::ERR_INTERNET_DISCONNECTED"
        }
      } as WebViewErrorEvent,
      expected: {
        message: "net::ERR_INTERNET_DISCONNECTED",
        code: -2,
        url: "https://example.com"
      }
    },
    {
      name: "an HTTP error",
      event: {
        nativeEvent: { url: "https://example.com", statusCode: 500 }
      } as WebViewHttpErrorEvent,
      expected: {
        message: "Unexpected HTTP status 500",
        code: 500,
        url: "https://example.com"
      }
    }
  ])("should keep the native details of $name", ({ event, expected }) => {
    expect(getWebViewErrorDebugInfo(event)).toStrictEqual(expected);
  });
});
