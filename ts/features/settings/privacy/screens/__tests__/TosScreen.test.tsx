import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
// import WebView from "react-native-webview";
// import {
//   WebViewErrorEvent,
//   WebViewNavigationEvent
// } from "react-native-webview/lib/WebViewTypes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import TosScreen from "../TosScreen";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

const CurrentTestToSVersion = 2.0;

// Restore defineProperty
beforeAll(() => {
  jest.resetAllMocks();
  jest.mock("../../../../../config");
  mockAccessibilityInfo(false);
});

afterAll(() => {
  jest.resetAllMocks();
});

describe("TosScreen", () => {
  describe("When rendering the screen for an onboarded user", () => {
    it("The back button should be there", () => {
      const renderAPI = commonSetup();

      // Back button should be there
      const backButtonRTI = renderAPI.queryAllByLabelText(
        I18n.t("global.buttons.back")
      )[0];
      expect(backButtonRTI).toBeDefined();
    });
  });
  describe("When rendering the screen", () => {
    it("The help button is rendered", () => {
      const renderAPI = commonSetup();
      const helpButtonRTI = renderAPI.queryAllByLabelText(
        I18n.t("global.accessibility.contextualHelp.open.label")
      )[0];
      expect(helpButtonRTI).toBeDefined();
    });
  });
  it("The title should have a specific text", () => {
    const renderAPI = commonSetup();
    const textRTI = renderAPI.queryByText(I18n.t("profile.main.privacy.title"));
    expect(textRTI).toBeDefined();
  });
  describe("When rendering the screen initially", () => {
    it("There should be the loading spinner overlay without the cancel button", async () => {
      const renderAPI = commonSetup();

      // Overlay component should be there
      const overlayComponentRTI = renderAPI.getByTestId("overlayComponent");
      expect(overlayComponentRTI).toBeTruthy();

      // Overlay should have the indeterminate spinner
      const activityIndicatorRTI = renderAPI.getByTestId("refreshIndicator");
      expect(activityIndicatorRTI).toBeTruthy();

      // There must not be the cancel button
      const cancelButtonRTI = renderAPI.queryByTestId(
        "loadingSpinnerOverlayCancelButton"
      );
      expect(cancelButtonRTI).toBeFalsy();
    });
  });
  // describe("When rendering the screen after the WebView has finished loading without any error", () => {
  //   it("The TosWebviewComponent should be rendered without any loading spinner overlayed", async () => {
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

  //     await act(() =>
  //       webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
  //     );

  //     // Overlay component should be there (since the top view is rendered nonetheless)
  //     const overlayComponentRTI = renderAPI.getByTestId("overlayComponent");
  //     expect(overlayComponentRTI).toBeTruthy();

  //     // There must not be the indeterminate spinner
  //     const activityIndicatorRTI = renderAPI.queryByTestId("refreshIndicator");
  //     expect(activityIndicatorRTI).toBeFalsy();

  //     // TosWebviewComponent should be rendered
  //     const webViewComponentRTI = renderAPI.getByTestId("toSWebViewContainer");
  //     expect(webViewComponentRTI).toBeTruthy();
  //   });
  // });
  describe("When rendering the screen, the state is loading and there are no state errors", () => {
    it("The ToS acceptance footer should not have been rendered", () => {
      const renderAPI = commonSetup();

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  // describe("When rendering the screen, the state is not loading but there are state errors", () => {
  //   it("The ToS acceptance footer should not have been rendered", async () => {
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

  //     await act(() => webView.value.props.onError?.({} as WebViewErrorEvent));

  //     const footerWithButtonsViewRTI =
  //       renderAPI.queryByTestId("FooterWithButtons");
  //     expect(footerWithButtonsViewRTI).toBeFalsy();
  //   });
  // });
  // describe("When rendering the screen, the state is not loading and there are no state errors", () => {
  //   it("The ToS acceptance footer should not have been rendered", async () => {
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

  //     await act(() =>
  //       webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
  //     );

  //     const footerWithButtonsViewRTI =
  //       renderAPI.queryByTestId("FooterWithButtons");
  //     expect(footerWithButtonsViewRTI).toBeFalsy();
  //   });
  // });
});

const commonSetup = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const globalProfile = pot.isSome(globalState.profile)
    ? globalState.profile.value
    : ({} as InitializedProfile);
  const testProfile = {
    ...globalProfile,
    accepted_tos_version: CurrentTestToSVersion,
    version: 0,
    email: "john.smith@gmail.com",
    is_email_validated: true
  };
  const testState = {
    ...globalState,
    remoteConfig: O.some({
      assistanceTool: {
        tool: ToolEnum.zendesk
      },
      cgn: {
        enabled: false
      },
      newPaymentSection: {
        enabled: false,
        min_app_version: {
          android: "0.0.0.0",
          ios: "0.0.0.0"
        }
      },
      fims: {
        enabled: false
      },
      tos: {
        tos_version: 3.2,
        tos_url: "https://www.example.com"
      },
      absolutePortalLinks: {
        io_web: "https://ioapp.it/it/accedi/",
        io_showcase: "https://io.italia.it/"
      },
      itw: {
        enabled: true,
        min_app_version: {
          android: "0.0.0.0",
          ios: "0.0.0.0"
        }
      }
    }),
    profile: pot.some(testProfile)
  } as GlobalState;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...testState
  } as GlobalState);

  return renderScreenWithNavigationStoreContext(
    () => <TosScreen />,
    SETTINGS_ROUTES.PROFILE_PRIVACY,
    {},
    store
  );
};

export {};
