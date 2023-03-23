import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import WebView from "react-native-webview";
import renderer from "react-test-renderer";
import * as O from "fp-ts/lib/Option";
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import TosWebviewComponent from "../TosWebviewComponent";

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
            handleError={() => undefined}
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
    it("The 'handleError' prop should have been invoked", () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const errorHandlerMock = jest.fn();
      commonSetup({ onError: errorHandlerMock });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onError?.({} as WebViewErrorEvent);

      // The error handler should have been invoked
      expect(errorHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When rendering and the webview finishes its loading without any error", () => {
    it("The 'handleLoadEnd' prop should have been invoked", () => {
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

      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

      // The load ended handler should have been invoked
      expect(loadEndedHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("When the properly loaded webview sends a javascript message", () => {
    it("The 'handleWebViewMessage' prop should have been invoked", () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const webViewMessageHandlerMock = jest.fn();
      commonSetup({ onWebViewMessageReceived: webViewMessageHandlerMock });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onMessage?.({} as WebViewMessageEvent);

      // The load ended handler should have been invoked
      expect(webViewMessageHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
});

type CurrentTestConfiguration = {
  shouldRenderFooter?: boolean;
  onLeftButton?: () => void;
  onRightButton?: () => void;
  onError?: () => void;
  onLoaded?: () => void;
  onWebViewMessageReceived?: (event: any) => void;
};

const commonSetup = ({
  shouldRenderFooter = true,
  onLeftButton = () => undefined,
  onRightButton = () => undefined,
  onError = () => undefined,
  onLoaded = () => undefined,
  onWebViewMessageReceived = _ => undefined
}: CurrentTestConfiguration = {}) =>
  render(
    <TosWebviewComponent
      shouldFooterRender={shouldRenderFooter}
      webViewSource={{ html: "<html><head></head><body></body></html>" }}
      handleLoadEnd={onLoaded}
      handleError={onError}
      onExit={onLeftButton}
      onAcceptTos={onRightButton}
      handleWebViewMessage={onWebViewMessageReceived}
    />
  );
