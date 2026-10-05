import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import { withStore } from "../../../../../../utils/jest/withStore";
import * as useOneIdentityLoginSourceModule from "../../../../../lollipop/hooks/useOneIdentityLoginSource";
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
          onAuthenticationUrlReceived={onAuthenticationUrlReceived}
        />
      );

      fireEvent.press(getByTestId("loadingSpinnerOverlayCancelButton"));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });
});
