import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";

import * as IOHooks from "../../../../../store/hooks";
import * as analyticsUtils from "../../../../../utils/analytics";
import { SpidIdp } from "../../../../../utils/idps";
import * as useOneIdentityLoginSourceModule from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import { IdpWebViewLogin } from "../IdpWebViewLogin";

jest.mock("react-native-webview", () => {
  const { forwardRef: reactForwardRef } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    WebView: reactForwardRef((props: object, ref: unknown) => (
      <View ref={ref as never} {...props} />
    ))
  };
});

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
        status: "ready",
        webviewSource: { uri: "https://example.com/authorize" }
      },
      shouldBlockUrlNavigationWhileCheckingLollipop:
        mockShouldBlockUrlNavigationWhileCheckingLollipop,
      ...overrides
    });

describe("IdpWebViewLogin", () => {
  const mockDispatch = jest.fn();
  const onEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest.spyOn(IOHooks, "useIOSelector").mockReturnValue(undefined);

    jest.spyOn(analyticsUtils, "trackSpidLoginError").mockImplementation();
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    mockShouldBlockUrlNavigationWhileCheckingLollipop.mockReturnValue(false);
  });

  describe("conditional rendering", () => {
    it.each(["reserving", "checking-lollipop"] as const)(
      "should render the loading state and no WebView when status is %s",
      status => {
        mockUseOneIdentityLoginSource({
          loginSourceState:
            status === "reserving"
              ? { status: "reserving" }
              : { status: "checking-lollipop", url: "https://example.com" }
        });

        const { queryByTestId } = render(
          <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
        );

        expect(queryByTestId("webview-idp-login-screen")).toBeNull();
      }
    );

    it("should render nothing when status is failure", () => {
      mockUseOneIdentityLoginSource({
        loginSourceState: { status: "failure", error: "some error" }
      });

      const { queryByTestId } = render(
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
      );

      expect(queryByTestId("webview-idp-login-screen")).toBeNull();
    });

    it.each(["ready", "trusted-lollipop"] as const)(
      "should render the WebView with the loginSourceState's webviewSource when status is %s",
      status => {
        const webviewSource = { uri: "https://example.com/authorize" };
        mockUseOneIdentityLoginSource({
          loginSourceState: { status, webviewSource }
        });

        const { getByTestId } = render(
          <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
        );

        const webview = getByTestId("webview-idp-login-screen");
        expect(webview.props.source).toEqual(webviewSource);
      }
    );
  });

  describe("onError / onHttpError", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onEvent with WEBVIEW_ERROR and track the error when there is a WebViewErrorEvent", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
      );

      const webview = getByTestId("webview-idp-login-screen");
      const nativeEvent = { url: "https://example.com/error" };
      fireEvent(webview, "onError", { nativeEvent });

      expect(onEvent).toHaveBeenCalledWith({
        type: "WEBVIEW_ERROR",
        payload: { url: nativeEvent.url }
      });
      expect(analyticsUtils.trackSpidLoginError).toHaveBeenCalledWith(
        mockIdp.id,
        { nativeEvent }
      );
    });

    it("should call onEvent with WEBVIEW_HTTP_ERROR and track the error when there is a WebViewHttpErrorEvent", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
      );

      const webview = getByTestId("webview-idp-login-screen");
      const nativeEvent = {
        url: "https://example.com/error",
        statusCode: 500
      };
      fireEvent(webview, "onHttpError", { nativeEvent });

      expect(onEvent).toHaveBeenCalledWith({
        type: "WEBVIEW_HTTP_ERROR",
        payload: { url: nativeEvent.url, statusCode: nativeEvent.statusCode }
      });
      expect(analyticsUtils.trackSpidLoginError).toHaveBeenCalledWith(
        mockIdp.id,
        { nativeEvent }
      );
    });
  });

  describe("onShouldStartLoadWithRequest", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should open the intent fallback URL and block navigation", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
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
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
      );

      const webview = getByTestId("webview-idp-login-screen");

      fireEvent(webview, "onShouldStartLoadWithRequest", {
        url: "https://idp.example.com/sso?SAMLRequest=encoded"
      });

      expect(onEvent).not.toHaveBeenCalled();
    });

    it("should call onEvent with LOGIN_SUCCESS on a successful login URL", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
      );

      const webview = getByTestId("webview-idp-login-screen");

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
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
      );

      const webview = getByTestId("webview-idp-login-screen");

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

  describe("onNavigationStateChange", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should dispatch idpLoginUrlChanged only when the URL basepath changes", () => {
      const { getByTestId } = render(
        <IdpWebViewLogin idp={mockIdp} onEvent={onEvent} />
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
});
