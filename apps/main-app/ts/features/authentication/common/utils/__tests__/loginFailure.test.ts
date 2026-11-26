import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import {
  getAuthErrorKey,
  getBackendFailure,
  getLoginFailureReason,
  getWebViewFailure,
  LoginFailure,
  NATIVE_REDIRECTS_FAILURE_REASONS,
  toRedirectsFailureReason,
  withBackendCodeAndMessage
} from "../loginFailure";

const URL_WITH_QUERY = "https://example.com/page?token=secret";

describe("getWebViewFailure", () => {
  test.each<{
    event: WebViewErrorEvent | WebViewHttpErrorEvent;
    expected: LoginFailure;
    name: string;
  }>([
    {
      name: "an HTTP error",
      event: {
        nativeEvent: {
          description: "Forbidden",
          statusCode: 403,
          url: URL_WITH_QUERY
        }
      } as WebViewHttpErrorEvent,
      expected: {
        kind: "webViewHttp",
        details: {
          description: "Forbidden",
          statusCode: 403,
          url: URL_WITH_QUERY
        }
      }
    },
    {
      name: "a native error",
      event: {
        nativeEvent: {
          code: -1009,
          description: "The Internet connection appears to be offline.",
          domain: "NSURLErrorDomain",
          url: URL_WITH_QUERY
        }
      } as WebViewErrorEvent,
      expected: {
        kind: "webViewNative",
        details: {
          code: -1009,
          description: "The Internet connection appears to be offline.",
          domain: "NSURLErrorDomain",
          url: URL_WITH_QUERY
        }
      }
    }
  ])("should map $name with the fields of the event", ({ event, expected }) => {
    expect(getWebViewFailure(event)).toStrictEqual(expected);
  });
});

describe("getLoginFailureReason", () => {
  test.each<{ expected: string; failure: LoginFailure; name: string }>([
    {
      name: "code and message",
      failure: getBackendFailure("1001", "minor"),
      expected: "login failure with code (1001) and message (minor)"
    },
    {
      name: "code only",
      failure: getBackendFailure("1001"),
      expected: "login failure with code (1001)"
    },
    {
      name: "message only",
      failure: getBackendFailure(undefined, "minor"),
      expected: "login failure with message (minor)"
    },
    {
      name: "no code or message",
      failure: getBackendFailure(),
      expected: "login failure with no code or message"
    },
    {
      name: "the CieID app prefix",
      failure: {
        kind: "cieIdApp",
        details: { errorCode: "CIEID_OPERATION_CANCEL" }
      },
      expected: "CieID app failure with code (CIEID_OPERATION_CANCEL)"
    }
  ])("should describe $name", ({ expected, failure }) => {
    expect(getLoginFailureReason(failure)).toBe(expected);
  });

  test.each<{ expected: string; failure: LoginFailure; name: string }>([
    {
      name: "a CIE card failure",
      failure: {
        kind: "cieCard",
        details: { attemptsLeft: 2, event: "ON_PIN_ERROR" }
      },
      expected: "cie card failure (ON_PIN_ERROR)"
    },
    {
      name: "an IdP app not opened with code",
      failure: {
        kind: "idpAppNotOpened",
        details: { code: "EUNSPECIFIED", url: URL_WITH_QUERY }
      },
      expected: "idp app not opened (EUNSPECIFIED)"
    },
    {
      name: "an IdP app not opened without code",
      failure: { kind: "idpAppNotOpened", details: { url: URL_WITH_QUERY } },
      expected: "idp app not opened"
    },
    {
      name: "a WebView HTTP error",
      failure: {
        kind: "webViewHttp",
        details: { description: "", statusCode: 500, url: URL_WITH_QUERY }
      },
      expected: "webview http error (500)"
    },
    {
      name: "a WebView native error",
      failure: {
        kind: "webViewNative",
        details: { code: -2, description: "offline", url: URL_WITH_QUERY }
      },
      expected: "webview error (-2)"
    }
  ])("should describe $name without its URL", ({ expected, failure }) => {
    const reason = getLoginFailureReason(failure);

    expect(reason).toBe(expected);
    expect(reason).not.toContain(URL_WITH_QUERY);
  });
});

describe("getAuthErrorKey", () => {
  test.each<{
    expected: string | undefined;
    failure: LoginFailure;
    name: string;
  }>([
    {
      name: "the code of a backend failure",
      failure: getBackendFailure("1004", "different fiscal code"),
      expected: "1004"
    },
    {
      name: "the message of a backend failure without code",
      failure: getBackendFailure(undefined, "Missing SAMLResponse in ACS"),
      expected: "Missing SAMLResponse in ACS"
    },
    {
      name: "the message of a backend failure with an empty code",
      failure: getBackendFailure("", "Missing SAMLResponse in ACS"),
      expected: "Missing SAMLResponse in ACS"
    },
    {
      name: "nothing for a backend failure with no code or message",
      failure: getBackendFailure(),
      expected: undefined
    },
    {
      name: "the code of a CieID app failure",
      failure: {
        kind: "cieIdApp",
        details: { errorCode: "CIEID_OPERATION_CANCEL" }
      },
      expected: "CIEID_OPERATION_CANCEL"
    },
    {
      name: "the message of a CieID app failure",
      failure: {
        kind: "cieIdApp",
        details: { errorMessage: "Operazione_annullata_dall'utente" }
      },
      expected: "Operazione_annullata_dall'utente"
    },
    {
      name: "nothing for any other kind",
      failure: {
        kind: "webViewHttp",
        details: { description: "", statusCode: 500, url: URL_WITH_QUERY }
      },
      expected: undefined
    }
  ])("should return $name", ({ expected, failure }) => {
    expect(getAuthErrorKey(failure)).toBe(expected);
  });
});

describe("withBackendCodeAndMessage", () => {
  test.each<{
    expected: [string | undefined, string | undefined];
    failure: LoginFailure;
    name: string;
  }>([
    {
      name: "the code and message of a backend failure",
      failure: getBackendFailure("1001", "minor"),
      expected: ["1001", "minor"]
    },
    {
      name: "no code or message for any other kind",
      failure: { kind: "keyGeneration", details: {} },
      expected: [undefined, undefined]
    }
  ])("should pass $name to the handler", ({ expected, failure }) => {
    const handler = jest.fn();

    withBackendCodeAndMessage(handler)(failure);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(...expected);
  });
});

describe("toRedirectsFailureReason", () => {
  test.each<{ expected: string; failure: LoginFailure; name: string }>([
    {
      name: "the legacy string for a key generation failure",
      failure: { kind: "keyGeneration", details: {} },
      expected: "Missing publicKey"
    },
    {
      name: "the reason of any other failure",
      failure: {
        kind: "nativeRedirects",
        details: {
          reason: NATIVE_REDIRECTS_FAILURE_REASONS.MISSING_SAML_REQUEST,
          url: URL_WITH_QUERY
        }
      },
      expected: NATIVE_REDIRECTS_FAILURE_REASONS.MISSING_SAML_REQUEST
    }
  ])("should return $name", ({ expected, failure }) => {
    expect(toRedirectsFailureReason(failure)).toBe(expected);
  });
});
