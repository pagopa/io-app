import {
  getLoginFailureDebugInfo,
  LoginFailure
} from "../loginFailureDebugInfo";

const scenarios: Array<{
  expected: ReturnType<typeof getLoginFailureDebugInfo>;
  failure: LoginFailure;
  name: string;
}> = [
  {
    name: "a backend failure with only the error code",
    failure: { type: "LOGIN_FAILURE", payload: { code: "19" } },
    expected: { type: "LOGIN_FAILURE", code: "19" }
  },
  {
    name: "a backend failure with error code and message",
    failure: {
      type: "LOGIN_FAILURE",
      payload: { code: "19", message: "annullato" }
    },
    expected: { type: "LOGIN_FAILURE", code: "19", message: "annullato" }
  },
  {
    name: "a backend failure without details",
    failure: { type: "LOGIN_FAILURE", payload: {} },
    expected: { type: "LOGIN_FAILURE", code: undefined }
  },
  {
    name: "a network error",
    failure: {
      type: "WEBVIEW_ERROR",
      payload: {
        url: "https://example.com/authorize",
        code: -1009,
        description: "The Internet connection appears to be offline."
      }
    },
    expected: {
      type: "WEBVIEW_ERROR",
      code: -1009,
      message: "The Internet connection appears to be offline.",
      url: "https://example.com/authorize"
    }
  },
  {
    name: "an HTTP error",
    failure: {
      type: "WEBVIEW_HTTP_ERROR",
      payload: { url: "https://example.com/authorize", statusCode: 500 }
    },
    expected: {
      type: "WEBVIEW_HTTP_ERROR",
      code: 500,
      url: "https://example.com/authorize"
    }
  },
  {
    name: "a OneIdentity failure",
    failure: {
      type: "ONE_IDENTITY_LOGIN_FAILURE",
      payload: { reason: "some reason" }
    },
    expected: { type: "ONE_IDENTITY_LOGIN_FAILURE", message: "some reason" }
  },
  {
    name: "a cancelled login",
    failure: { type: "CANCEL" },
    expected: { type: "CANCEL" }
  }
];

describe("getLoginFailureDebugInfo", () => {
  test.each(scenarios)(
    "should flatten $name into the debug fields",
    ({ failure, expected }) => {
      expect(getLoginFailureDebugInfo(failure)).toStrictEqual(expected);
    }
  );
});
