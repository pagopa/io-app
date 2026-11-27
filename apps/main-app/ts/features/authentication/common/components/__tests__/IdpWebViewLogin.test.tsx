import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";

import * as IOHooks from "../../../../../store/hooks";
import * as analyticsUtils from "../../../../../utils/analytics";
import { SpidIdp } from "../../../../../utils/idps";
import * as supportAssistance from "../../../../../utils/supportAssistance";
import * as useOneIdentityLoginSourceModule from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import { getSpidErrorCodeDescription } from "../../../login/idp/utils/spidErrorCode";
import * as analytics from "../../analytics";
import * as usePosteIDEducationalModule from "../../hooks/useOneIdentityPosteIDApp2AppEducational";
import { LoginFailure } from "../../utils/loginFailure";
import { IdpWebViewLogin } from "../IdpWebViewLogin";

const mockWebViewMount = jest.fn();

jest.mock("react-native-webview", () => {
  const { forwardRef: reactForwardRef, useEffect: reactUseEffect } =
    jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    WebView: reactForwardRef((props: object, ref: unknown) => {
      reactUseEffect(() => {
        mockWebViewMount();
      }, []);
      return <View ref={ref as never} {...props} />;
    })
  };
});

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    present: jest.fn(),
    dismiss: jest.fn(),
    bottomSheet: <></>
  }))
}));

const mockIdp = {
  id: "idp-id",
  name: "idp-name"
} as unknown as SpidIdp;

const mockShouldBlockUrlNavigationWhileCheckingLollipop = jest.fn(() => false);

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

describe("IdpWebViewLogin", () => {
  const mockDispatch = jest.fn();
  const onFailure = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest.spyOn(IOHooks, "useIOSelector").mockReturnValue(undefined);

    jest.spyOn(analyticsUtils, "trackLoginError").mockImplementation();
    jest
      .spyOn(supportAssistance, "handleSendAssistanceLog")
      .mockImplementation();
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(false);
  });

  it.each([
    { name: "auth", flow: "auth" as const },
    { name: "reauth", flow: "reauth" as const }
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
        <IdpWebViewLogin
          flow={flow}
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );
      const webview = getByTestId("webview-idp-login-screen");

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
      "should render the loading state and no WebView when status is $name",
      ({ status }) => {
        mockUseOneIdentityLoginSource({ loginSourceState: { status } });

        const { getByTestId, queryByTestId } = render(
          <IdpWebViewLogin
            idp={mockIdp}
            onFailure={onFailure}
            onSuccess={onSuccess}
          />
        );

        expect(getByTestId("refreshIndicator")).toBeTruthy();
        expect(queryByTestId("webview-idp-login-screen")).toBeNull();
      }
    );

    it("should render a loading indicator in the WebView's renderLoading content", () => {
      mockUseOneIdentityLoginSource();

      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");
      const { getByTestId: getByTestIdInLoading } = render(
        webview.props.renderLoading()
      );

      expect(getByTestIdInLoading("refreshIndicator")).toBeTruthy();
    });

    it("should keep the WebView mounted, without the loading state, while verifying the assertion-ref", () => {
      const webviewSource = { uri: "https://example.com/authorize" };
      mockUseOneIdentityLoginSource({
        loginSourceState: {
          status: "verifying-assertion-ref",
          url: "https://idp.example.com/sso?SAMLRequest=abc",
          webviewSource
        }
      });

      const { getByTestId, queryByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      expect(queryByTestId("refreshIndicator")).toBeNull();
      expect(getByTestId("webview-idp-login-screen").props.source).toEqual(
        webviewSource
      );
    });

    it("should keep the same WebView instance from the /authorize request to the IDP SSO page", () => {
      const authorizeSource = { uri: "https://example.com/authorize" };
      const ssoUrl = "https://idp.example.com/sso?SAMLRequest=abc";
      // A new `onFailure` on every step bypasses `memo`, so that the component
      // re-renders and reads the new mocked login source state
      const renderStep = () => (
        <IdpWebViewLogin
          idp={mockIdp}
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
      expect(getByTestId("webview-idp-login-screen").props.source).toEqual(
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
      expect(getByTestId("webview-idp-login-screen").props.source).toEqual({
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
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      expect(queryByTestId("webview-idp-login-screen")).toBeNull();
    });

    it.each(["one-identity-authorize", "assertion-ref-verified"] as const)(
      "should render the WebView with the loginSourceState's webviewSource when status is %s",
      status => {
        const webviewSource = { uri: "https://example.com/authorize" };
        mockUseOneIdentityLoginSource({
          loginSourceState: { status, webviewSource }
        });

        const { getByTestId } = render(
          <IdpWebViewLogin
            idp={mockIdp}
            onFailure={onFailure}
            onSuccess={onSuccess}
          />
        );

        const webview = getByTestId("webview-idp-login-screen");
        expect(webview.props.source).toEqual(webviewSource);
      }
    );

    it("should render the WebView in incognito mode", () => {
      mockUseOneIdentityLoginSource();

      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");
      expect(webview.props.incognito).toBe(true);
    });
  });

  describe("onError / onHttpError", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onFailure with the failure of the login source", () => {
      render(
        <IdpWebViewLogin
          idp={mockIdp}
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

    it("should call onFailure with webViewNative and track the error when there is a WebViewErrorEvent", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");
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
      expect(analyticsUtils.trackLoginError).toHaveBeenCalledWith(mockIdp.id, {
        nativeEvent
      });
    });

    it("should call onFailure with webViewHttp and track the error when there is a WebViewHttpErrorEvent", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");
      const nativeEvent = {
        url: "https://example.com/error",
        statusCode: 500
      };
      fireEvent(webview, "onHttpError", { nativeEvent });

      expect(onFailure).toHaveBeenCalledWith({
        kind: "webViewHttp",
        details: {
          statusCode: nativeEvent.statusCode,
          url: nativeEvent.url
        }
      });
      expect(analyticsUtils.trackLoginError).toHaveBeenCalledWith(mockIdp.id, {
        nativeEvent
      });
    });
  });

  describe("onShouldStartLoadWithRequest", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should open the intent fallback URL and block navigation", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");

      const intentUrl =
        "intent://my.app/#Intent;scheme=https;package=com.my.app;S.browser_fallback_url=https://fallback.example.com;end";
      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: intentUrl
      });

      expect(Linking.openURL).toHaveBeenCalledWith(
        "https://fallback.example.com"
      );
    });

    it("should block navigation when LolliPOP is being checked", () => {
      mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(true);

      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: "https://idp.example.com/sso?SAMLRequest=encoded"
      });

      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should call onSuccess with the token on a successful login URL", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");

      const successUrl =
        "https://io.italia.it/profile.html#token=session-token-123";

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: successUrl
      });

      expect(onSuccess).toHaveBeenCalledWith("session-token-123");
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should call onFailure with backend and log it for assistance on a failed login URL", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");

      const failureUrl =
        "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato";
      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: failureUrl
      });

      expect(onFailure).toHaveBeenCalledWith({
        kind: "backend",
        details: { errorCode: "19", errorMessage: "annullato" }
      });
      expect(supportAssistance.handleSendAssistanceLog).toHaveBeenCalledWith(
        expect.anything(),
        `login failed with code (19) : ${getSpidErrorCodeDescription("19")}`
      );
    });
  });

  describe("onNavigationStateChange", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should dispatch idpLoginUrlChanged only when the URL basepath changes", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      const webview = getByTestId("webview-idp-login-screen");
      fireEvent(webview, "onNavigationStateChange", {
        url: "https://example.com/path-a?query=1"
      });
      fireEvent(webview, "onNavigationStateChange", {
        url: "https://example.com/path-a?query=2"
      });

      expect(mockDispatch).toHaveBeenCalledTimes(1);

      fireEvent(webview, "onNavigationStateChange", {
        url: "https://example.com/path-b"
      });

      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("PosteID educational bottom sheet", () => {
    const mockPresentOnce = jest.fn();

    beforeEach(() => {
      mockUseOneIdentityLoginSource();
      jest
        .spyOn(
          usePosteIDEducationalModule,
          "useOneIdentityPosteIDApp2AppEducational"
        )
        .mockReturnValue({
          bottomSheet: <></>,
          presentOnce: mockPresentOnce
        });
    });

    it("should present the bottom sheet when the WebView loads", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin
          idp={mockIdp}
          onFailure={onFailure}
          onSuccess={onSuccess}
        />
      );

      expect(mockPresentOnce).not.toHaveBeenCalled();

      fireEvent(getByTestId("webview-idp-login-screen"), "onLoad");

      expect(mockPresentOnce).toHaveBeenCalledTimes(1);
    });

    it.each([
      {
        name: "onError",
        nativeEvent: { url: "https://example.com/error" }
      },
      {
        name: "onHttpError",
        nativeEvent: { url: "https://example.com/error", statusCode: 403 }
      }
    ])(
      "should not present the bottom sheet on $name",
      ({ name, nativeEvent }) => {
        const { getByTestId } = render(
          <IdpWebViewLogin
            idp={mockIdp}
            onFailure={onFailure}
            onSuccess={onSuccess}
          />
        );

        fireEvent(getByTestId("webview-idp-login-screen"), name, {
          nativeEvent
        });

        expect(mockPresentOnce).not.toHaveBeenCalled();
      }
    );
  });
});
