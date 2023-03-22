import { act, fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import WebView from "react-native-webview";
import renderer from "react-test-renderer";
import * as O from "fp-ts/lib/Option";
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import I18n from "i18n-js";
import TosWebviewComponent from "../TosWebviewComponent";
import * as urlUtils from "../../../ts/utils/url";
import brokenLinkImage from "../../../img/broken-link.png";

beforeAll(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});

describe("TosWebviewComponent", () => {
  describe("The snapshot for the TosWebviewComponent", () => {
    it("Should render correctly with bottom footer and a basic placeholding HTML", () => {
      const tree = renderer
        .create(
          <TosWebviewComponent
            shouldFooterRender={true}
            webViewSource={{ html: "<html><head></head><body></body></html>" }}
            handleLoadEnd={() => undefined}
            handleReload={() => undefined} // TODO
          />
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe("When rendering with the shouldFooterRender set to false", () => {
    it("The footer should not render", () => {
      const renderAPI = commonSetup({ shouldRenderFooter: false });

      // The footer should be rendered
      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  describe("When rendering with the footer displayed", () => {
    it("Clicking the left button should trigger 'onExit' prop handler", () => {
      const leftButtonHandlerMock = jest.fn();
      const renderAPI = commonSetup({ onLeftButton: leftButtonHandlerMock });

      // Find the left button and press it
      const footerWithButtonsViewRTI = renderAPI.getByTestId(
        "toSWebViewContainerFooterLeftButton"
      );
      fireEvent.press(footerWithButtonsViewRTI);

      // The left button handler should have been invoked
      expect(leftButtonHandlerMock).toHaveBeenCalledTimes(1);
    });
    it("Clicking the right button should trigger 'onAcceptTos' prop handler", () => {
      const rightButtonHandlerMock = jest.fn();
      const renderAPI = commonSetup({ onRightButton: rightButtonHandlerMock });

      // Find the right button and press it
      const footerWithButtonsViewRTI = renderAPI.getByTestId(
        "toSWebViewContainerFooterRightButton"
      );
      fireEvent.press(footerWithButtonsViewRTI);

      // The right button handler should have been invoked
      expect(rightButtonHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When rendering and there is an error", () => {
    it("The error overlay should have been rendered with proper values and the web view should not have been rendered", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const renderAPI = commonSetup();

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      await act(() => webView.value.props.onError?.({} as WebViewErrorEvent));

      // Error container should be there
      const errorContainerViewRTI = renderAPI.getByTestId(
        "toSErrorContainerView"
      );
      expect(errorContainerViewRTI).toBeTruthy();
      // Error image
      const errorContainerImageRTI = renderAPI.getByTestId(
        "toSErrorContainerImage"
      );
      const errorContainerImageSource = errorContainerImageRTI.props.source;
      expect(errorContainerImageSource).toBe(brokenLinkImage);
      // Error title
      const errorContainerTitleTextRTI = renderAPI.getByTestId(
        "toSErrorContainerTitle"
      );
      expect(errorContainerTitleTextRTI.props.children).toEqual(
        I18n.t("onboarding.tos.error")
      );
      // Error button text
      const errorContainerButtonTextRTI = renderAPI.getByTestId(
        "toSErrorContainerButtonText"
      );
      expect(errorContainerButtonTextRTI.props.children).toEqual(
        I18n.t("global.buttons.retry")
      );

      // TosWebviewComponent should not be rendered
      const webViewComponentRTI = renderAPI.queryByTestId(
        "toSWebViewContainer"
      );
      expect(webViewComponentRTI).toBeFalsy();
    });
    it("Pressing the 'retry' button should invoke the `handleReload` callback and the component views should change", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const onReloadMock = jest.fn();
      const renderAPI = commonSetup({ onReload: onReloadMock });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      await act(() => webView.value.props.onError?.({} as WebViewErrorEvent));

      const retryButtonRTI = renderAPI.getByTestId("toSErrorContainerButton");
      fireEvent.press(retryButtonRTI);

      expect(onReloadMock).toHaveBeenCalledTimes(1);

      // Error container should not be rendered
      const errorContainerViewRTI = renderAPI.queryByTestId(
        "toSErrorContainerView"
      );
      expect(errorContainerViewRTI).toBeFalsy();

      // TosWebviewComponent should be rendered
      const webViewComponentRTI = renderAPI.getByTestId("toSWebViewContainer");
      expect(webViewComponentRTI).toBeTruthy();
    });
    it("The 'onLoaded' prop should have been invoked", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const onLoadedMock = jest.fn();
      commonSetup({ onLoaded: onLoadedMock });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      await act(() => webView.value.props.onError?.({} as WebViewErrorEvent));

      // The error handler should have been invoked
      expect(onLoadedMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When rendering and the webview finishes its loading without any error", () => {
    it("The 'handleLoadEnd' prop should have been invoked", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const loadEndedHandlerMock = jest.fn();
      commonSetup({ onLoaded: loadEndedHandlerMock });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      await act(() =>
        webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
      );

      // The load ended handler should have been invoked
      expect(loadEndedHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When the properly loaded webview sends a javascript message to open an Url", () => {
    it("The 'openWebUrl' method should have been invoked", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const spiedOpenWebUrl = jest.spyOn(urlUtils, "openWebUrl");
      const webViewMessageHandlerMock = jest.fn();
      commonSetup({ onWebViewMessageReceived: webViewMessageHandlerMock });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      const mockedUrl = "https://www.myurl.com";
      await act(() =>
        webView.value.props.onMessage?.({
          nativeEvent: {
            data: `{"type":"LINK_MESSAGE","payload":{"href":"${mockedUrl}"}}`
          }
        } as unknown as WebViewMessageEvent)
      );

      // The load ended handler should have been invoked
      expect(spiedOpenWebUrl).toHaveBeenCalledWith(mockedUrl);
    });
  });
});

type CurrentTestConfiguration = {
  shouldRenderFooter?: boolean;
  onLeftButton?: () => void;
  onRightButton?: () => void;
  onReload?: () => void;
  onLoaded?: () => void;
  onWebViewMessageReceived?: (event: any) => void;
};

const commonSetup = ({
  shouldRenderFooter = true,
  onLeftButton = () => undefined,
  onRightButton = () => undefined,
  onReload = () => undefined,
  onLoaded = () => undefined
}: CurrentTestConfiguration = {}) =>
  render(
    <TosWebviewComponent
      shouldFooterRender={shouldRenderFooter}
      webViewSource={{ html: "<html><head></head><body></body></html>" }}
      handleLoadEnd={onLoaded}
      handleReload={onReload}
      onExit={onLeftButton}
      onAcceptTos={onRightButton}
    />
  );
