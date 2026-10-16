import { act, fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import * as utilsAnalytics from "../../../../../../utils/analytics";
import { withStore } from "../../../../../../utils/jest/withStore";
import * as useOneIdentityLoginSourceModule from "../../../../../lollipop/hooks/useOneIdentityLoginSource";
import * as analytics from "../../../../common/analytics";
import { LOGIN_TYPES } from "../../../../common/utils";
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
          url: "https://example.com"
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
        loginSourceState: { status: "failure", error: "some error" }
      });

      const { getByText, queryByTestId } = render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      expect(queryByTestId("cie-authentication-webview")).toBeNull();
      expect(
        getByText(I18n.t("authentication.errors.network.title"))
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
        getByText(I18n.t("authentication.errors.network.title"))
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
        queryByText(I18n.t("authentication.errors.network.title"))
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
        getByText(I18n.t("authentication.errors.network.title"))
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
        getByText(I18n.t("authentication.errors.network.title"))
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
        getByText(I18n.t("authentication.errors.network.title"))
      ).toBeTruthy();
    });
  });

  describe("retry / cancel", () => {
    it("should reset to the authenticating state and call generateLoginSource when retry is pressed", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "failure", error: "some error" }
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
        loginSourceState: { status: "failure", error: "some error" }
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

    it("should set the login source error as the debug message", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "failure", error: "some error" }
      });

      render(
        <OneIdentityCieAuthenticationWebView
          flow={LOGIN_TYPES.AUTH}
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      expect(mockUseDebugInfo).toHaveBeenLastCalledWith({
        message: "some error"
      });
    });

    it("should set the debug info of the login source failure, when there is one", () => {
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
      const debugInfo = {
        message: "Reserve request failed: Unexpected HTTP status 500",
        url: "https://example.com/api/auth/v1/reserve"
      };

      act(() => onFailure("Unexpected HTTP status 500", debugInfo));

      expect(mockUseDebugInfo).toHaveBeenLastCalledWith(debugInfo);
    });

    it.each([
      {
        name: "a WebView error",
        event: "onError",
        nativeEvent: {
          url: "https://example.com/error",
          code: -2,
          description: "net::ERR_INTERNET_DISCONNECTED"
        },
        expectedDebugInfo: {
          message: "net::ERR_INTERNET_DISCONNECTED",
          code: -2,
          url: "https://example.com/error"
        },
        expectedReason: "WebView error on https://example.com/error"
      },
      {
        name: "an HTTP error",
        event: "onHttpError",
        nativeEvent: { url: "https://example.com/error", statusCode: 500 },
        expectedDebugInfo: {
          message: "Unexpected HTTP status 500",
          code: 500,
          url: "https://example.com/error"
        },
        expectedReason: "HTTP error 500 on https://example.com/error"
      },
      {
        name: "an error page",
        event: "onLoadEnd",
        nativeEvent: { title: "Errore" },
        expectedDebugInfo: { message: "Errore" },
        expectedReason: "Errore"
      }
    ])(
      "should set the debug info and keep the analytics reason on $name",
      ({ event, nativeEvent, expectedDebugInfo, expectedReason }) => {
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

        expect(mockUseDebugInfo).toHaveBeenLastCalledWith(expectedDebugInfo);
        expect(utilsAnalytics.trackLoginError).toHaveBeenCalledWith(
          "cie",
          new Error(expectedReason)
        );
      }
    );
  });
});
