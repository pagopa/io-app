import { fireEvent, render } from "@testing-library/react-native";

import * as useOneIdentityLoginSourceModule from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import * as useCieIdAppModule from "../../hooks/useCieIdApp";
import { CieIdWebViewLogin } from "../CieIdWebViewLogin";

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

  describe("conditional rendering", () => {
    it.each(["reserving-public-key", "verifying-assertion-ref"] as const)(
      "should render the loading overlay and no WebView when status is %s",
      status => {
        mockUseOneIdentityLoginSource({
          loginSourceState:
            status === "reserving-public-key"
              ? { status: "reserving-public-key" }
              : {
                  status: "verifying-assertion-ref",
                  url: "https://example.com"
                }
        });

        const { queryByTestId } = render(
          <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
        );

        expect(queryByTestId("cie-id-webview")).toBeNull();
      }
    );

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
  });

  describe("onError / onHttpError", () => {
    beforeEach(() => {
      mockUseOneIdentityLoginSource();
    });

    it("should call onEvent with WEBVIEW_ERROR when there is a WebViewErrorEvent", () => {
      const { getByTestId } = render(
        <CieIdWebViewLogin isUat={false} onEvent={onEvent} />
      );

      const webview = getByTestId("cie-id-webview");
      const nativeEvent = { url: "https://example.com/error" };
      fireEvent(webview, "onError", { nativeEvent });

      expect(onEvent).toHaveBeenCalledWith({
        type: "WEBVIEW_ERROR",
        payload: { url: nativeEvent.url }
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
        payload: { url: nativeEvent.url, statusCode: nativeEvent.statusCode }
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
