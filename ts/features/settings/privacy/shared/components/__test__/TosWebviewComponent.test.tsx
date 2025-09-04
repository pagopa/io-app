import { fireEvent, render } from "@testing-library/react-native";
// import WebView from "react-native-webview";
import renderer from "react-test-renderer";
// import * as O from "fp-ts/lib/Option";
// import {
//   WebViewErrorEvent,
//   WebViewMessageEvent,
//   WebViewNavigationEvent
// } from "react-native-webview/lib/WebViewTypes";
// import I18n from "i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TosWebviewComponent from "../TosWebviewComponent";
import { FlowType } from "../../../../../../utils/analytics";
// import * as urlUtils from "../../../ts/utils/url";

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
          <SafeAreaProvider
            initialMetrics={{
              frame: {
                width: 320,
                height: 640,
                x: 0,
                y: 0
              },
              insets: {
                left: 0,
                right: 0,
                bottom: 0,
                top: 0
              }
            }}
          >
            <TosWebviewComponent
              flow="firstOnboarding"
              shouldRenderFooter={true}
              webViewSource={{
                html: "<html><head></head><body></body></html>"
              }}
              handleLoadEnd={() => undefined}
              handleReload={() => undefined} // TODO
            />
          </SafeAreaProvider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe("When rendering with the shouldRenderFooter set to false", () => {
    it("The footer should not render", () => {
      const renderAPI = commonSetup({ shouldRenderFooter: false });
      // The footer should be rendered
      const footerWithButtonsViewRTI = renderAPI.queryByTestId("FooterActions");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  describe("When rendering with the footer displayed", () => {
    it("Clicking the button to accept ToS. Should trigger 'onAcceptTos' prop handler", () => {
      const rightButtonHandlerMock = jest.fn();
      const renderAPI = commonSetup({
        onRightButton: rightButtonHandlerMock
      });
      // Find the right button and press it
      const footerDefined = renderAPI.queryByTestId("FooterActions");
      expect(footerDefined).toBeDefined();
      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("AcceptToSButton");
      expect(footerWithButtonsViewRTI).toBeDefined();
      if (footerWithButtonsViewRTI) {
        fireEvent.press(footerWithButtonsViewRTI);
        expect(rightButtonHandlerMock).toHaveBeenCalledTimes(1);
      }
    });
  });
  // describe("When rendering and there is an error", () => {
  // it("The error overlay should have been rendered with proper values and the web view should not have been rendered", async () => {
  // // eslint-disable-next-line functional/no-let
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const renderAPI = commonSetup();
  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;
  //   await act(() => WebViewMock.prototype.onError?.({} as WebViewErrorEvent));
  //   // Error container should be there
  //   const errorContainerViewRTI = renderAPI.getByTestId(
  //     "toSErrorContainerView"
  //   );
  //   expect(errorContainerViewRTI).toBeTruthy();
  //   // Error image
  //   const errorContainerImageRTI = renderAPI.getByTestId(
  //     "toSErrorContainerImage"
  //   );
  //   const errorContainerImageSource = errorContainerImageRTI.props.source;
  //   expect(errorContainerImageSource).toBe(brokenLinkImage);
  //   // Error title
  //   const errorContainerTitleTextRTI = renderAPI.getByTestId(
  //     "toSErrorContainerTitle"
  //   );
  //   expect(errorContainerTitleTextRTI.props.children).toEqual(
  //     I18n.t("onboarding.tos.error")
  //   );
  //   // Error button text
  //   const errorContainerButtonTextRTI = renderAPI.getByTestId(
  //     "toSErrorContainerButtonText"
  //   );
  //   expect(errorContainerButtonTextRTI.props.children).toEqual(
  //     I18n.t("global.buttons.retry")
  //   );
  //   // TosWebviewComponent should not be rendered
  //   const webViewComponentRTI = renderAPI.queryByTestId(
  //     "toSWebViewContainer"
  //   );
  //   expect(webViewComponentRTI).toBeFalsy();
  // });
  //   it("Pressing the 'retry' button should invoke the `handleReload` callback and the component views should change", async () => {
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const onReloadMock = jest.fn();
  //     const renderAPI = commonSetup({ onReload: onReloadMock });
  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;
  //     await act(() => webView.value.props.onError?.({} as WebViewErrorEvent));
  //     const retryButtonRTI = renderAPI.getByTestId("toSErrorContainerButton");
  //     fireEvent.press(retryButtonRTI);
  //     expect(onReloadMock).toHaveBeenCalledTimes(1);
  //     // Error container should not be rendered
  //     const errorContainerViewRTI = renderAPI.queryByTestId(
  //       "toSErrorContainerView"
  //     );
  //     expect(errorContainerViewRTI).toBeFalsy();
  //     // TosWebviewComponent should be rendered
  //     const webViewComponentRTI = renderAPI.getByTestId("toSWebViewContainer");
  //     expect(webViewComponentRTI).toBeTruthy();
  //   });
  //   it("The 'onLoaded' prop should have been invoked", async () => {
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const onLoadedMock = jest.fn();
  //     commonSetup({ onLoaded: onLoadedMock });
  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;
  //     await act(() => webView.value.props.onError?.({} as WebViewErrorEvent));
  //     // The error handler should have been invoked
  //     expect(onLoadedMock).toHaveBeenCalledTimes(1);
  //   });
  // });
  // describe("When rendering and the webview finishes its loading without any error", () => {
  //   it("The 'handleLoadEnd' prop should have been invoked", async () => {
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const loadEndedHandlerMock = jest.fn();
  //     commonSetup({ onLoaded: loadEndedHandlerMock });
  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;
  //     await act(() =>
  //       webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
  //     );
  //     // The load ended handler should have been invoked
  //     expect(loadEndedHandlerMock).toHaveBeenCalledTimes(1);
  //   });
  // });
  // describe("When the properly loaded webview sends a javascript message to open an Url", () => {
  //   it("The 'openWebUrl' method should have been invoked", async () => {
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const spiedOpenWebUrl = jest.spyOn(urlUtils, "openWebUrl");
  //     const webViewMessageHandlerMock = jest.fn();
  //     commonSetup({ onWebViewMessageReceived: webViewMessageHandlerMock });

  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;

  //     const mockedUrl = "https://www.myurl.com";
  //     await act(() =>
  //       webView.value.props.onMessage?.({
  //         nativeEvent: {
  //           data: `{"type":"LINK_MESSAGE","payload":{"href":"${mockedUrl}"}}`
  //         }
  //       } as unknown as WebViewMessageEvent)
  //     );

  //     // The openWebUrl method should have been invoked
  //     expect(spiedOpenWebUrl).toHaveBeenCalledWith(mockedUrl);
  //   });
  // });
});

type CurrentTestConfiguration = {
  shouldRenderFooter?: boolean;
  onRightButton?: () => void;
  onReload?: () => void;
  onLoaded?: () => void;
  onWebViewMessageReceived?: (event: any) => void;
  flow?: FlowType;
};

const commonSetup = ({
  shouldRenderFooter = true,
  onRightButton = () => undefined,
  onReload = () => undefined,
  onLoaded = () => undefined,
  flow = "firstOnboarding"
}: CurrentTestConfiguration = {}) =>
  render(
    <SafeAreaProvider>
      <TosWebviewComponent
        flow={flow}
        shouldRenderFooter={shouldRenderFooter}
        webViewSource={{ html: "<html><head></head><body></body></html>" }}
        handleLoadEnd={onLoaded}
        handleReload={onReload}
        onAcceptTos={onRightButton}
      />
    </SafeAreaProvider>
  );
