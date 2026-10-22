import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../utils/jest/withStore";
import * as useOneIdentityLoginSourceModule from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import * as analytics from "../../analytics";
import * as useCieIdAppModule from "../../hooks/useCieIdApp";
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
  const onEvent = jest.fn();

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
        <CieIdWebViewLogin flow={flow} isUat={false} onEvent={onEvent} />
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
          <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
        );

        expect(getByTestId("refreshIndicator")).toBeTruthy();
        expect(queryByTestId("cie-id-webview")).toBeNull();
      }
    );

    it("should render a loading indicator in the WebView's renderLoading content", () => {
      mockUseOneIdentityLoginSource();

      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");
      const { getByTestId: getByTestIdInLoading } = render(
        webview.props.renderLoading()
      );

      expect(getByTestIdInLoading("refreshIndicator")).toBeTruthy();
    });

    it("should keep the WebView mounted under the loading overlay while verifying the assertion-ref", () => {
      const webviewSource = { uri: "https://example.com/authorize" };
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "verifying-assertion-ref",
          url: "https://idserver.example.com/sso?SAMLRequest=abc",
          webviewSource
        }
      });

      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      expect(getByTestId("refreshIndicator")).toBeTruthy();
      const webview = getByTestId("cie-id-webview");
      expect(webview.props.source).toEqual(webviewSource);
      expect(webview.props.accessibilityElementsHidden).toBe(true);
      expect(webview.props.importantForAccessibility).toBe(
        "no-hide-descendants"
      );
    });

    it("should keep the same WebView instance from the /authorize request to the IDP SSO page", () => {
      const authorizeSource = { uri: "https://example.com/authorize" };
      const ssoUrl = "https://idserver.example.com/sso?SAMLRequest=abc";
      // A new `onEvent` on every step bypasses `memo`, so that the component
      // re-renders and reads the new mocked login source state
      const renderStep = () => (
        <CieIdWebViewLogin isUat={false} onEvent={e => onEvent(e)} />
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
      expect(getByTestId("refreshIndicator")).toBeTruthy();
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
      const webview = getByTestId("cie-id-webview");
      expect(webview.props.source).toEqual({ uri: ssoUrl });
      expect(webview.props.accessibilityElementsHidden).toBe(false);
      expect(webview.props.importantForAccessibility).toBe("auto");

      expect(mockWebViewMount).toHaveBeenCalledTimes(1);
    });

    it("should render nothing when status is failure", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "failure", error: "some error" }
      });

      const { queryByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
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
          <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
        );

        const webview = getByTestId("cie-id-webview");
        expect(webview.props.source).toEqual(webviewSource);
      }
    );

    it("should render the WebView in incognito mode", () => {
      mockUseOneIdentityLoginSource();

      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");
      expect(webview.props.incognito).toBe(true);
    });
  });

  describe("onError / onHttpError", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onEvent with ONE_IDENTITY_LOGIN_FAILURE and the failure data when the login source fails", () => {
      render(<CieIdWebViewLogin isUat={false} onEvent={onEvent} />);
      const { onFailure } = jest.mocked(
        useOneIdentityLoginSourceModule.useOneIdentityLoginSource
      ).mock.calls[0][0];
      const failureData = {
        reason: "Unexpected HTTP status 500",
        url: "https://example.com/api/auth/v1/reserve"
      };

      onFailure(failureData);

      expect(onEvent).toHaveBeenCalledWith({
        type: "ONE_IDENTITY_LOGIN_FAILURE",
        payload: { failureData }
      });
    });

    it("should call onEvent with WEBVIEW_ERROR when there is a WebViewErrorEvent", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");
      const nativeEvent = {
        url: "https://example.com/error",
        code: -2,
        description: "net::ERR_INTERNET_DISCONNECTED"
      };
      fireEvent(webview, "onError", { nativeEvent });

      expect(onEvent).toHaveBeenCalledWith({
        type: "WEBVIEW_ERROR",
        payload: {
          url: nativeEvent.url,
          failureData: {
            description: nativeEvent.description,
            code: nativeEvent.code,
            url: nativeEvent.url
          }
        }
      });
    });

    it("should call onEvent with WEBVIEW_HTTP_ERROR when there is a WebViewHttpErrorEvent", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");
      const nativeEvent = {
        url: "https://example.com/error",
        statusCode: 500
      };
      fireEvent(webview, "onHttpError", { nativeEvent });

      expect(onEvent).toHaveBeenCalledWith({
        type: "WEBVIEW_HTTP_ERROR",
        payload: {
          url: nativeEvent.url,
          statusCode: nativeEvent.statusCode,
          failureData: {
            description: `Unexpected HTTP status ${nativeEvent.statusCode}`,
            code: nativeEvent.statusCode,
            url: nativeEvent.url
          }
        }
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
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: "https://idserver.example.com/sso?SAMLRequest=encoded"
      });

      expect(onEvent).not.toHaveBeenCalled();
      expect(mockStartCieIdApp).not.toHaveBeenCalled();
    });

    it("should start the CieID app when the URL is an authentication URL", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");
      const authUrl =
        "https://idserver.servizicie.interno.gov.it/idp/login/livello2?value=e1s2";

      fireEvent(webview, "onShouldStartLoadWithRequest", { url: authUrl });

      expect(mockStartCieIdApp).toHaveBeenCalledWith(authUrl);
      expect(onEvent).not.toHaveBeenCalled();
    });

    it("should call onEvent with LOGIN_SUCCESS on a successful login URL", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");

      const successUrl =
        "https://io.italia.it/profile.html#token=session-token-123";

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: successUrl
      });

      expect(onEvent).toHaveBeenCalledWith({
        type: "LOGIN_SUCCESS",
        payload: { token: "session-token-123" }
      });
    });

    it("should call onEvent with LOGIN_FAILURE on a failed login URL", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");

      const failureUrl =
        "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato";
      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: failureUrl
      });

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "LOGIN_FAILURE",
          payload: {
            code: "19",
            message: "annullato",
            reason: expect.any(String)
          }
        })
      );
    });
  });

  describe("useCieIdApp callbacks", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onEvent with INVALID_URL when the CieID app returns an untrusted URL", () => {
      render(<CieIdWebViewLogin isUat={false} onEvent={onEvent} />);

      const { onSuccess } = jest.mocked(useCieIdAppModule.useCieIdApp).mock
        .calls[0][0];

      onSuccess("https://not-allowed.example.com/callback");

      expect(onEvent).toHaveBeenCalledWith({
        type: "NOT_ALLOWED_URL",
        payload: { url: "https://not-allowed.example.com/callback" }
      });
    });

    it("should call onEvent with LOGIN_FAILURE when the CieID app fails", () => {
      render(<CieIdWebViewLogin isUat={false} onEvent={onEvent} />);

      const { onFailure } = jest.mocked(useCieIdAppModule.useCieIdApp).mock
        .calls[0][0];

      onFailure("some-error-code");

      expect(onEvent).toHaveBeenCalledWith({
        type: "LOGIN_FAILURE",
        payload: {
          code: "some-error-code",
          message: undefined,
          reason: expect.any(String)
        }
      });
    });
  });

  describe("onCancel", () => {
    it("should call onEvent with CANCEL when the loading overlay's cancel button is pressed", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "reserving-public-key" }
      });

      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      fireEvent.press(getByTestId("loadingSpinnerOverlayCancelButton"));

      expect(onEvent).toHaveBeenCalledWith({ type: "CANCEL" });
    });
  });
});
