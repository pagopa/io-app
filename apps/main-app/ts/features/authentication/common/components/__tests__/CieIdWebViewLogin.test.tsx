import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../utils/jest/withStore";
import * as useOneIdentityLoginSourceModule from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import * as analytics from "../../analytics";
import * as useCieIdAppModule from "../../hooks/useCieIdApp";
import { LoginFailure } from "../../utils/loginFailure";
import { CieIdWebViewLogin as CieIdWebViewLoginComponent } from "../CieIdWebViewLogin";

const CieIdWebViewLogin = withStore(CieIdWebViewLoginComponent);

const mockWebViewMount = jest.fn();

jest.mock("react-native-webview", () => {
  const { forwardRef: reactForwardRef, useEffect: reactUseEffect } =
    jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const WebView = reactForwardRef((props: object, ref: unknown) => {
    reactUseEffect(() => {
      mockWebViewMount();
    }, []);
    return <View ref={ref as never} {...props} />;
  });
  return {
    WebView,
    default: WebView,
    __esModule: true
  };
});

const mockShouldBlockUrlNavigationWhileCheckingLollipop = jest.fn(() => false);
const mockStartCieIdApp = jest.fn();

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
      generateLoginSource: jest.fn(),
      ...overrides
    });

describe("CieIdWebViewLogin", () => {
  const onFailure = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(false);
    jest.spyOn(useCieIdAppModule, "useCieIdApp").mockReturnValue({
      startCieIdApp: mockStartCieIdApp
    });
  });

  it.each([
    { name: "initial login", flow: "auth" as const },
    { name: "reauthentication", flow: "reauth" as const }
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
        <CieIdWebViewLogin
          cieEnv="production"
          flow={flow}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );
      const webview = getByTestId("cie-id-webview");

      expect(
        fireEvent(webview, "onShouldStartLoadWithRequest", { url: errorUrl })
      ).toBe(true);
      expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledTimes(1);
      expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledWith(
        errorUrl,
        flow
      );
    }
  );

  describe("conditional rendering", () => {
    it.each([
      { name: "reserving-public-key", status: "reserving-public-key" as const },
      { name: "following-redirects", status: "following-redirects" as const }
    ])(
      "should render the loading overlay and no WebView when status is $name",
      ({ status }) => {
        mockUseOneIdentityLoginSource({ loginSourceState: { status } });

        const { getByTestId, queryByTestId } = render(
          <CieIdWebViewLogin
            cieEnv="production"
            onFailure={onFailure}
            onSuccess={onSuccess}
          />
        );

        expect(getByTestId("refreshIndicator")).toBeTruthy();
        expect(queryByTestId("cie-id-webview")).toBeNull();
      }
    );

    it("should render a loading indicator in the WebView's renderLoading content", () => {
      mockUseOneIdentityLoginSource();

      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");
      const { getByTestId: getByTestIdInLoading } = render(
        webview.props.renderLoading()
      );

      expect(getByTestIdInLoading("refreshIndicator")).toBeTruthy();
    });

    it("should keep the WebView mounted, without the loading overlay, while verifying the assertion-ref", () => {
      const webviewSource = { uri: "https://example.com/authorize" };
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "verifying-assertion-ref",
          url: "https://idserver.example.com/sso?SAMLRequest=abc",
          webviewSource
        }
      });

      const { getByTestId, queryByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      expect(queryByTestId("refreshIndicator")).toBeNull();
      expect(getByTestId("cie-id-webview").props.source).toEqual(webviewSource);
    });

    it("should keep the same WebView instance from the /authorize request to the IDP SSO page", () => {
      const authorizeSource = { uri: "https://example.com/authorize" };
      const ssoUrl = "https://idserver.example.com/sso?SAMLRequest=abc";
      // A new `onFailure` on every step bypasses `memo`, so that the component
      // re-renders and reads the new mocked login source state
      const renderStep = () => (
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={f => onFailure(f)}
          onSuccess={onSuccess}
        />
      );

      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "one-identity-authorize",
          webviewSource: authorizeSource
        }
      });
      const { getByTestId, queryByTestId, rerender } = render(renderStep());

      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "verifying-assertion-ref",
          url: ssoUrl,
          webviewSource: authorizeSource
        }
      });
      rerender(renderStep());
      expect(getByTestId("cie-id-webview").props.source).toEqual(
        authorizeSource
      );

      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "assertion-ref-verified",
          webviewSource: { uri: ssoUrl }
        }
      });
      rerender(renderStep());
      expect(queryByTestId("refreshIndicator")).toBeNull();
      expect(getByTestId("cie-id-webview").props.source).toEqual({
        uri: ssoUrl
      });

      expect(mockWebViewMount).toHaveBeenCalledTimes(1);
    });

    it("should render nothing when status is failure", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "failure",
          failure: { kind: "keyGeneration", details: {} }
        }
      });

      const { queryByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      expect(queryByTestId("cie-id-webview")).toBeNull();
    });

    it.each(["one-identity-authorize", "assertion-ref-verified"] as const)(
      "should render the WebView with the loginSourceState's webviewSource when status is %s",
      status => {
        const webviewSource = { uri: "https://example.com/authorize" };
        mockUseOneIdentityLoginSource({
          loginSourceState: { status, webviewSource }
        });

        const { getByTestId } = render(
          <CieIdWebViewLogin
            cieEnv="production"
            onFailure={onFailure}
            onSuccess={onSuccess}
          />
        );

        const webview = getByTestId("cie-id-webview");
        expect(webview.props.source).toEqual(webviewSource);
      }
    );

    it("should render the WebView in incognito mode", () => {
      mockUseOneIdentityLoginSource();

      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");
      expect(webview.props.incognito).toBe(true);
    });
  });

  describe("onError / onHttpError", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onFailure with the failure of the login source", () => {
      render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );
      const { onFailure: onLoginSourceFailure } = jest.mocked(
        useOneIdentityLoginSourceModule.useOneIdentityLoginSource
      ).mock.calls[0][0];
      const failure: LoginFailure = {
        kind: "reserve",
        details: {
          reason: "Unexpected HTTP status 500",
          url: "https://example.com/api/auth/v1/reserve"
        }
      };

      onLoginSourceFailure(failure);

      expect(onFailure).toHaveBeenCalledWith(failure);
    });

    it("should call onFailure with webViewNative when there is a WebViewErrorEvent", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");
      const nativeEvent = {
        url: "https://example.com/error",
        code: -2,
        description: "net::ERR_INTERNET_DISCONNECTED"
      };
      fireEvent(webview, "onError", { nativeEvent });

      expect(onFailure).toHaveBeenCalledWith({
        kind: "webViewNative",
        details: {
          code: nativeEvent.code,
          description: nativeEvent.description,
          url: nativeEvent.url
        }
      });
    });

    it("should call onFailure with webViewHttp when there is a WebViewHttpErrorEvent", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");
      const nativeEvent = {
        url: "https://example.com/error",
        statusCode: 500
      };
      fireEvent(webview, "onHttpError", { nativeEvent });

      expect(onFailure).toHaveBeenCalledWith({
        kind: "webViewHttp",
        details: { statusCode: nativeEvent.statusCode, url: nativeEvent.url }
      });
    });
  });

  describe("onShouldStartLoadWithRequest", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should block navigation when LolliPOP is being checked", () => {
      mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(true);

      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: "https://idserver.example.com/sso?SAMLRequest=encoded"
      });

      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockStartCieIdApp).not.toHaveBeenCalled();
    });

    it("should start the CieID app when the URL is an authentication URL", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");
      const authUrl =
        "https://idserver.servizicie.interno.gov.it/idp/login/livello2?value=e1s2";

      fireEvent(webview, "onShouldStartLoadWithRequest", { url: authUrl });

      expect(mockStartCieIdApp).toHaveBeenCalledWith(authUrl);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should call onSuccess with the token on a successful login URL", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");

      const successUrl =
        "https://io.italia.it/profile.html#token=session-token-123";

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: successUrl
      });

      expect(onSuccess).toHaveBeenCalledWith("session-token-123");
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should call onFailure with backend on a failed login URL", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("cie-id-webview");

      const failureUrl =
        "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato";
      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: failureUrl
      });

      expect(onFailure).toHaveBeenCalledWith({
        kind: "backend",
        details: { errorCode: "19", errorMessage: "annullato" }
      });
    });
  });

  describe("useCieIdApp callbacks", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onFailure with cieIdUrlNotAllowed when the CieID app returns an untrusted URL", () => {
      render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const { onSuccess: onCieIdAppSuccess } = jest.mocked(
        useCieIdAppModule.useCieIdApp
      ).mock.calls[0][0];

      onCieIdAppSuccess("https://not-allowed.example.com/callback");

      expect(onFailure).toHaveBeenCalledWith({
        kind: "cieIdUrlNotAllowed",
        details: { url: "https://not-allowed.example.com/callback" }
      });
    });

    it("should call onFailure with the failure of the CieID app", () => {
      render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const { onFailure: onCieIdAppFailure } = jest.mocked(
        useCieIdAppModule.useCieIdApp
      ).mock.calls[0][0];
      const failure: LoginFailure = {
        kind: "cieIdApp",
        details: { errorCode: "GENERIC_ERROR" }
      };

      onCieIdAppFailure(failure);

      expect(onFailure).toHaveBeenCalledWith(failure);
    });
  });

  describe("onCancel", () => {
    it("should call onFailure with cancelled when the loading overlay's cancel button is pressed", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "reserving-public-key" }
      });

      const { getByTestId } = render(
        <CieIdWebViewLogin
          cieEnv="production"
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      fireEvent.press(getByTestId("loadingSpinnerOverlayCancelButton"));

      expect(onFailure).toHaveBeenCalledWith({
        kind: "cancelled",
        details: {}
      });
    });
  });
});
