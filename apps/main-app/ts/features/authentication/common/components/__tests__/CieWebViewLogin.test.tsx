import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../utils/jest/withStore";
import * as analytics from "../../analytics";
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
  const onFailure = jest.fn();
  const onSuccess = jest.fn();
  const url = "https://idserver.example.com/idp/profile/SAML2/POST/SSO";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { name: "auth", flow: "auth" as const },
    { name: "reauth", flow: "reauth" as const }
  ])(
    "should track One Identity configuration error when is error page ($name)",
    ({ flow }) => {
      const spyTrackLoginOIConfigurationError = jest
        .spyOn(analytics, "trackLoginOIConfigurationError")
        .mockImplementation();
      const errorUrl =
        "https://dev.oneid.pagopa.it/login/error?error_code=GENERIC_HTML_ERROR";
      const { getByTestId } = render(
        <CieWebViewLogin
          flow={flow}
          onFailure={onFailure}
          onSuccess={onSuccess}
          url={url}
        />
      );
      const webview = getByTestId("cie-webview");

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

  it("should render the WebView with the given url as source", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
    expect(webview.props.source).toEqual({ uri: url });
  });

  it("should not render the WebView in incognito mode, as the CIE+PIN flow relies on cookies shared across WebViews", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
    expect(webview.props.incognito).toBeUndefined();
  });

  it("should render a loading indicator in the WebView's renderLoading content", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const { getByTestId: getByTestIdInLoading } = render(
      webview.props.renderLoading()
    );

    expect(getByTestIdInLoading("LoadingIndicator")).toBeTruthy();
  });

  it("should call onFailure with webViewNative when there is a WebViewErrorEvent", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
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
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
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

  it("should call onSuccess with the token and block navigation on a successful login URL", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const successUrl =
      "https://io.italia.it/profile.html#token=session-token-123";

    const returnValue = fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: successUrl
    });

    expect(onSuccess).toHaveBeenCalledWith("session-token-123");
    expect(onFailure).not.toHaveBeenCalled();
    expect(returnValue).toBe(false);
  });

  it("should call onFailure with backend on a failed login URL", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const failureUrl =
      "https://io.italia.it/error.html?errorCode=19&errorMessage=annullato";

    fireEvent(webview, "onShouldStartLoadWithRequest", { url: failureUrl });

    expect(onFailure).toHaveBeenCalledWith({
      kind: "backend",
      details: { errorCode: "19", errorMessage: "annullato" }
    });
  });

  it("should not block navigation and should not call the callbacks for a generic URL", () => {
    const { getByTestId } = render(
      <CieWebViewLogin onFailure={onFailure} onSuccess={onSuccess} url={url} />
    );

    const webview = getByTestId("cie-webview");
    const returnValue = fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://idserver.example.com/some-intermediate-step"
    });

    expect(onFailure).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(returnValue).toBe(true);
  });
});
