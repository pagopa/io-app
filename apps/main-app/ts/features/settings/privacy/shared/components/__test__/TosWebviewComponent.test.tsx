import { fireEvent, render } from "@testing-library/react-native";
// import I18n from "i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FlowType } from "../../../../../../utils/analytics";
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
      const { toJSON } = render(
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
            handleLoadEnd={() => undefined}
            handleReload={() => undefined} // TODO
            shouldRenderFooter={true}
            webViewSource={{
              html: "<html><head></head><body></body></html>"
            }}
          />
        </SafeAreaProvider>
      );
      expect(toJSON()).toMatchSnapshot();
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
});

type CurrentTestConfiguration = {
  flow?: FlowType;
  onLoaded?: () => void;
  onReload?: () => void;
  onRightButton?: () => void;
  onWebViewMessageReceived?: (event: any) => void;
  shouldRenderFooter?: boolean;
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
        handleLoadEnd={onLoaded}
        handleReload={onReload}
        onAcceptTos={onRightButton}
        shouldRenderFooter={shouldRenderFooter}
        webViewSource={{ html: "<html><head></head><body></body></html>" }}
      />
    </SafeAreaProvider>
  );
