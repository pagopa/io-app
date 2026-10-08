import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../utils/jest/withStore";
import { CieWebViewLogin as CieWebViewLoginComponent } from "../CieWebViewLogin";

const CieWebViewLogin = withStore(CieWebViewLoginComponent);

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

describe("CieWebViewLogin", () => {
  const onEvent = jest.fn();
  const url = "https://idserver.example.com/idp/profile/SAML2/POST/SSO";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the WebView with the given url as source", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
    expect(webview.props.source).toEqual({ uri: url });
  });

  it("should render a loading indicator in the WebView's renderLoading content", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const { getByTestId: getByTestIdInLoading } = render(
      webview.props.renderLoading()
    );

    expect(getByTestIdInLoading("LoadingIndicator")).toBeTruthy();
  });

  it("should call onEvent with WEBVIEW_ERROR when there is a WebViewErrorEvent", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const nativeEvent = { url: "https://example.com/error" };
    fireEvent(webview, "onError", { nativeEvent });

    expect(onEvent).toHaveBeenCalledWith({
      type: "WEBVIEW_ERROR",
      payload: { url: nativeEvent.url }
    });
  });

  it("should call onEvent with WEBVIEW_HTTP_ERROR when there is a WebViewHttpErrorEvent", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
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

  it("should call onEvent with LOGIN_SUCCESS and block navigation on a successful login URL", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const successUrl =
      "https://io.italia.it/profile.html#token=session-token-123";

    const returnValue = fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: successUrl
    });

    expect(onEvent).toHaveBeenCalledWith({
      type: "LOGIN_SUCCESS",
      payload: { token: "session-token-123" }
    });
    expect(returnValue).toBe(false);
  });

  it("should call onEvent with LOGIN_FAILURE on a failed login URL", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const failureUrl =
      "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato";

    fireEvent(webview, "onShouldStartLoadWithRequest", { url: failureUrl });

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

  it("should not block navigation and should not call onEvent for a generic URL", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onEvent={onEvent} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const returnValue = fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://idserver.example.com/some-intermediate-step"
    });

    expect(onEvent).not.toHaveBeenCalled();
    expect(returnValue).toBe(true);
  });
});
