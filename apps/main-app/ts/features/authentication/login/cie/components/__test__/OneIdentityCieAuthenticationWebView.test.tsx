import { act, fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Platform } from "react-native";

import * as utilsAnalytics from "../../../../../../utils/analytics";
import { withStore } from "../../../../../../utils/jest/withStore";
import * as useOneIdentityLoginSourceModule from "../../../../../lollipop/hooks/useOneIdentityLoginSource";
import * as analytics from "../../../../common/analytics";
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig";
import { LOGIN_TYPES } from "../../../../common/utils";
import { LoginFailure } from "../../../../common/utils/loginFailure";
import { OneIdentityCieAuthenticationWebView as OneIdentityCieAuthenticationWebViewComponent } from "../OneIdentityCieAuthenticationWebView";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack
    })
  };
});

jest.mock("react-native-webview", () => {
  const { forwardRef: reactForwardRef } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const WebView = reactForwardRef((props: object, ref: unknown) => (
    <View ref={ref as never} {...props} />
  ));
  return {
    WebView,
    default: WebView,
    __esModule: true
  };
});

const OneIdentityCieAuthenticationWebView = withStore(
  OneIdentityCieAuthenticationWebViewComponent
);

const mockUseDebugInfo = jest.fn();
jest.mock("../../../../../../hooks/useDebugInfo", () => ({
  useDebugInfo: (data: unknown) => mockUseDebugInfo(data)
}));

const mockShouldBlockUrlNavigationWhileCheckingLollipop = jest.fn(() => false);
const mockGenerateLoginSource = jest.fn();

const mockUseOneIdentityLoginSource = (
  overrides?: Partial<
    ReturnType<typeof useOneIdentityLoginSourceModule.useOneIdentityLoginSource>
  >
) =>
  jest
    .spyOn(useOneIdentityLoginSourceModule, "useOneIdentityLoginSource")
    .mockReturnValue({
      loginSourceState: {
        status: "one-identity-authorize",
        webviewSource: { uri: "https://example.com/authorize" }
      },
      shouldBlockUrlNavigationWhileCheckingLollipop:
        mockShouldBlockUrlNavigationWhileCheckingLollipop,
      generateLoginSource: mockGenerateLoginSource,
      ...overrides
    });

describe("OneIdentityCieAuthenticationWebView", () => {
  const onAuthenticationUrlReceived = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(false);
  });

  it.each([
    { name: "auth", flow: "auth" as const },
    { name: "reauth", flow: "reauth" as const },
    { name: "FCI_auth", flow: "FCI_auth" as const }
  ])(
    "should track One Identity configuration error when is error page ($name)",
    ({ flow }) => {
      mockUseOneIdentityLoginSource();
      const spyTrackLoginOIConfigurationError = jest
        .spyOn(analytics, "trackLoginOIConfigurationError")
        .mockImplementation();
      const errorUrl =
        "https://dev.oneid.pagopa.it/login/error?error_code=GENERIC_HTML_ERROR";
      const { getByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={flow}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );
      const webview = getByTestId("cie-authentication-webview");

      expect(
        fireEvent(webview, "onShouldStartLoadWithRequest", { url: errorUrl })
      ).toBe(true);
      expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledTimes(1);
      expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledWith(
        errorUrl,
        flow
      );
      expect(onAuthenticationUrlReceived).not.toHaveBeenCalled();
    }
  );

  describe("clearSessionCookies", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each([
      { platform: "android" as const, flag: true, expected: true },
      { platform: "android" as const, flag: false, expected: false },
      { platform: "ios" as const, flag: true, expected: false },
      { platform: "ios" as const, flag: false, expected: false }
    ])(
      "should pass clearSessionCookies $expected on $platform when the remote flag is $flag",
      ({ platform, flag, expected }) => {
        jest.replaceProperty(Platform, "OS", platform);
        jest
          .spyOn(
            remoteConfigSelectors,
            "oneIdentityCieAndroidClearSessionCookiesEnabledSelector"
          )
          .mockReturnValue(flag);
        const spyUseOneIdentityLoginSource = mockUseOneIdentityLoginSource();

        render(
          <OneIdentityCieAuthenticationWebView
            flow={LOGIN_TYPES.AUTH}
            onAuthenticationUrlReceived={onAuthenticationUrlReceived}
          />
        );

        expect(spyUseOneIdentityLoginSource).toHaveBeenCalledWith(
          expect.objectContaining({ clearSessionCookies: expected })
        );
      }
    );
  });

  describe("conditional rendering", () => {
    it.each([
      {
        status: "reserving-public-key",
        loginSourceState: { status: "reserving-public-key" as const }
      },
      {
        status: "verifying-assertion-ref",
        loginSourceState: {
          status: "verifying-assertion-ref" as const,
          url: "https://example.com",
          webviewSource: { uri: "https://example.com/authorize" }
        }
      }
    ])(
      "should render the loading overlay and no WebView when status is $status",
      ({ loginSourceState }) => {
        mockUseOneIdentityLoginSource({ loginSourceState });

        const { queryByTestId } = render(
          <OneIdentityCieAuthenticationWebView
            flow={LOGIN_TYPES.AUTH}
            onAuthenticationUrlReceived={onAuthenticationUrlReceived}
          />
        );

        expect(queryByTestId("cie-authentication-webview")).toBeNull();
      }
    );

    it("should render the WebView with the loginSourceState's webviewSource when ready", () => {
      const webviewSource = { uri: "https://example.com/authorize" };
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "one-identity-authorize", webviewSource }
      });

      const { getByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      expect(webview.props.source).toEqual(webviewSource);
    });

    it("should render the failure screen when loginSourceState is 'failure'", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "failure",
          failure: { kind: "keyGeneration", details: {} }
        }
      });

      const { getByText, queryByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      expect(queryByTestId("cie-authentication-webview")).toBeNull();
      expect(
        getByText(I18n.t("authentication.auth_errors.generic.title"))
      ).toBeTruthy();
      expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
      expect(getByText(I18n.t("global.buttons.cancel"))).toBeTruthy();
    });
  });

  describe("onLoadEnd", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should render the failure screen when the page title matches an error page", () => {
      const { getByTestId, getByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      fireEvent(webview, "onLoadEnd", {
        nativeEvent: { title: "Errore" }
      });

      expect(
        getByText(I18n.t("authentication.auth_errors.generic.title"))
      ).toBeTruthy();
    });

    it("should not fail when the page title does not match an error page", () => {
      const { getByTestId, queryByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      fireEvent(webview, "onLoadEnd", {
        nativeEvent: { title: "Some regular page" }
      });

      expect(
        queryByText(I18n.t("authentication.auth_errors.generic.title"))
      ).toBeNull();
    });
  });

  describe("onError / onHttpError", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should render the failure screen on a WebView error", () => {
      const { getByTestId, getByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      fireEvent(webview, "onError", {
        nativeEvent: { url: "https://example.com/error" }
      });

      expect(
        getByText(I18n.t("authentication.auth_errors.generic.title"))
      ).toBeTruthy();
    });

    it("should render the failure screen on an HTTP error", () => {
      const { getByTestId, getByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      fireEvent(webview, "onHttpError", {
        nativeEvent: { url: "https://example.com/error", statusCode: 500 }
      });

      expect(
        getByText(I18n.t("authentication.auth_errors.generic.title"))
      ).toBeTruthy();
    });
  });

  describe("onShouldStartLoadWithRequest", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should block navigation and not report the URL when LolliPOP is being checked", () => {
      mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(true);

      const { getByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: "https://idp.example.com/sso?SAMLRequest=encoded"
      });

      expect(onAuthenticationUrlReceived).not.toHaveBeenCalled();
    });

    it("should call onAuthenticationUrlReceived when the URL is an authentication URL", () => {
      const { getByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      const authUrl =
        "https://idserver.example.com/login?authnRequestString=abc";

      fireEvent(webview, "onShouldStartLoadWithRequest", { url: authUrl });

      expect(onAuthenticationUrlReceived).toHaveBeenCalledWith(authUrl);
    });

    it("should render the failure screen on a failed login URL", () => {
      const { getByTestId, getByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      const webview = getByTestId("cie-authentication-webview");
      const failureUrl =
        "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato";
      fireEvent(webview, "onShouldStartLoadWithRequest", { url: failureUrl });

      expect(onAuthenticationUrlReceived).not.toHaveBeenCalled();
      expect(
        getByText(I18n.t("authentication.auth_errors.generic.title"))
      ).toBeTruthy();
    });
  });

  describe("retry / cancel", () => {
    it("should reset to the authenticating state and call generateLoginSource when retry is pressed", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "failure",
          failure: { kind: "keyGeneration", details: {} }
        }
      });

      const { getByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      fireEvent.press(getByText(I18n.t("global.buttons.retry")));

      expect(mockGenerateLoginSource).toHaveBeenCalledTimes(1);
    });

    it("should navigate back when cancel is pressed from the failure screen", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "failure",
          failure: { kind: "keyGeneration", details: {} }
        }
      });

      const { getByText } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      fireEvent.press(getByText(I18n.t("global.buttons.cancel")));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it("should navigate back when the loading overlay's cancel button is pressed", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "reserving-public-key" }
      });

      const { getByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      fireEvent.press(getByTestId("loadingSpinnerOverlayCancelButton"));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("debug info", () => {
    it("should not set any debug data while authenticating", () => {
      mockUseOneIdentityLoginSource();

      render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      expect(mockUseDebugInfo).toHaveBeenLastCalledWith({});
    });

    it("should set the failure of the login source and track its reason", () => {
      jest.spyOn(utilsAnalytics, "trackLoginError").mockImplementation();
      mockUseOneIdentityLoginSource();

      render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );
      const { onFailure } = jest.mocked(
        useOneIdentityLoginSourceModule.useOneIdentityLoginSource
      ).mock.calls[0][0];
      const failure: LoginFailure = {
        kind: "reserve",
        details: {
          reason: "Unexpected HTTP status 500",
          url: "https://example.com/api/auth/v1/reserve"
        }
      };

      act(() => onFailure(failure));

      expect(mockUseDebugInfo).toHaveBeenLastCalledWith(failure);
      expect(utilsAnalytics.trackLoginError).toHaveBeenCalledTimes(1);
      expect(utilsAnalytics.trackLoginError).toHaveBeenCalledWith(
        "cie",
        new Error("Unexpected HTTP status 500")
      );
    });

    it.each([
      {
        name: "an error page",
        event: "onLoadEnd",
        eventData: {
          nativeEvent: { title: "Errore", url: "https://example.com/error" }
        },
        expectedFailure: {
          kind: "cieErrorPage",
          details: { title: "Errore", url: "https://example.com/error" }
        },
        expectedReason: "Errore"
      },
      {
        name: "a failed login URL",
        event: "onShouldStartLoadWithRequest",
        eventData: {
          url: "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato"
        },
        expectedFailure: {
          kind: "backend",
          details: { errorCode: "19", errorMessage: "annullato" }
        },
        expectedReason: "login failure with code (19) and message (annullato)"
      }
    ])(
      "should set the failure and track its reason on $name",
      ({ event, eventData, expectedFailure, expectedReason }) => {
        jest.spyOn(utilsAnalytics, "trackLoginError").mockImplementation();
        mockUseOneIdentityLoginSource();

        const { getByTestId } = render(
          <OneIdentityCieAuthenticationWebView
            flow={LOGIN_TYPES.AUTH}
            onAuthenticationUrlReceived={onAuthenticationUrlReceived}
          />
        );

        fireEvent(getByTestId("cie-authentication-webview"), event, eventData);

        expect(mockUseDebugInfo).toHaveBeenLastCalledWith(expectedFailure);
        expect(utilsAnalytics.trackLoginError).toHaveBeenCalledTimes(1);
        expect(utilsAnalytics.trackLoginError).toHaveBeenCalledWith(
          "cie",
          new Error(expectedReason)
        );
      }
    );

    // Regression: a WebView failure used to send `SPID_ERROR` twice, the second
    // time with the full URL in the reason
    it.each([
      {
        name: "a WebView error",
        event: "onError",
        nativeEvent: {
          url: "https://example.com/error?token=secret",
          code: -2,
          description: "net::ERR_INTERNET_DISCONNECTED"
        },
        expectedFailure: {
          kind: "webViewNative",
          details: {
            code: -2,
            description: "net::ERR_INTERNET_DISCONNECTED",
            url: "https://example.com/error?token=secret"
          }
        }
      },
      {
        name: "an HTTP error",
        event: "onHttpError",
        nativeEvent: {
          url: "https://example.com/error?token=secret",
          statusCode: 500
        },
        expectedFailure: {
          kind: "webViewHttp",
          details: {
            statusCode: 500,
            url: "https://example.com/error?token=secret"
          }
        }
      }
    ])(
      "should set the failure and track $name only once, from its event",
      ({ event, nativeEvent, expectedFailure }) => {
        jest.spyOn(utilsAnalytics, "trackLoginError").mockImplementation();
        mockUseOneIdentityLoginSource();

        const { getByTestId } = render(
          <OneIdentityCieAuthenticationWebView
            flow={LOGIN_TYPES.AUTH}
            onAuthenticationUrlReceived={onAuthenticationUrlReceived}
          />
        );

        fireEvent(getByTestId("cie-authentication-webview"), event, {
          nativeEvent
        });

        expect(mockUseDebugInfo).toHaveBeenLastCalledWith(expectedFailure);
        expect(utilsAnalytics.trackLoginError).toHaveBeenCalledTimes(1);
        expect(utilsAnalytics.trackLoginError).toHaveBeenCalledWith("cie", {
          nativeEvent
        });
      }
    );
  });
});
