import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
// import WebView from "react-native-webview";
// import {
//   WebViewErrorEvent,
//   WebViewNavigationEvent
// } from "react-native-webview/lib/WebViewTypes";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import ROUTES from "../../../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
// import * as ToastUtils from "../../../utils/showToast";
import OnboardingTosScreen from "../OnboardingTosScreen";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";

const CurrentTestToSVersion = 2.0;

// Restore defineProperty
beforeAll(() => {
  jest.resetAllMocks();
  jest.mock("../../../../config");
  mockAccessibilityInfo(false);
});

afterAll(() => {
  jest.resetAllMocks();
});

describe("TosScreen", () => {
  describe("When rendering the screen for an user that has not accepted the current ToS version", () => {
    it("The informative header should be rendered", () => {
      const renderAPI = commonSetup({
        acceptedToSVersion: CurrentTestToSVersion - 0.1
      });
      const viewRTI = renderAPI.getByTestId("currentToSNotAcceptedView");
      expect(viewRTI).toBeDefined();
    });
  });
  describe("When rendering the screen for an user that has accepted the current ToS version", () => {
    it("The informative header should not be rendered", () => {
      const renderAPI = commonSetup();
      const viewRTI = renderAPI.queryByTestId("currentToSNotAcceptedView");
      expect(viewRTI).toBeFalsy();
    });
  });
  describe("When rendering the screen for an user that has not accepted the current ToS version but has completed the onboarding", () => {
    it("The informative header should have a specific text", () => {
      const renderAPI = commonSetup({
        acceptedToSVersion: CurrentTestToSVersion - 0.1,
        isProfileFirstOnBoarding: false
      });
      const textRTI = renderAPI.queryByText(
        I18n.t("profile.main.privacy.privacyPolicy.updated")
      );
      expect(textRTI).toBeTruthy();
    });
  });
  describe("When rendering the screen for an user that has not accepted the current ToS version and has not completed the onboarding", () => {
    it("The informative header should have a specific text", () => {
      const renderAPI = commonSetup({
        acceptedToSVersion: CurrentTestToSVersion - 0.1
      });
      const textRTI = renderAPI.queryByText(
        I18n.t("profile.main.privacy.privacyPolicy.infobox")
      );
      expect(textRTI).toBeTruthy();
    });
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
  // describe("When rendering the screen after the WebView has finished loading without any error but the profile is someUpdating", () => {
  //   it("There should be the loading spinner overlay without the cancel button", async () => {
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const renderAPI = commonSetup({ profilePotType: "someUpdating" });

  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;

  //     await act(() =>
  //       webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
  //     );

  //     // Overlay component should be there
  //     const overlayComponentRTI = renderAPI.getByTestId("overlayComponent");
  //     expect(overlayComponentRTI).toBeTruthy();

  //     // Overlay should have the indeterminate spinner
  //     const activityIndicatorRTI = renderAPI.getByTestId("refreshIndicator");
  //     expect(activityIndicatorRTI).toBeTruthy();

  //     // There must not be the cancel button
  //     const cancelButtonRTI = renderAPI.queryByTestId(
  //       "loadingSpinnerOverlayCancelButton"
  //     );
  //     expect(cancelButtonRTI).toBeFalsy();
  //   });
  // });
  // describe("When rendering the screen after the WebView has finished loading without any error but the profile is noneUpdating", () => {
  //   it("There should be the loading spinner overlay without the cancel button", async () => {
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     const renderAPI = commonSetup({ profilePotType: "noneUpdating" });

  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;

  //     await act(() =>
  //       webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
  //     );

  //     // Overlay component should be there
  //     const overlayComponentRTI = renderAPI.getByTestId("overlayComponent");
  //     expect(overlayComponentRTI).toBeTruthy();

  //     // Overlay should have the indeterminate spinner
  //     const activityIndicatorRTI = renderAPI.getByTestId("refreshIndicator");
  //     expect(activityIndicatorRTI).toBeTruthy();

  //     // There must not be the cancel button
  //     const cancelButtonRTI = renderAPI.queryByTestId(
  //       "loadingSpinnerOverlayCancelButton"
  //     );
  //     expect(cancelButtonRTI).toBeFalsy();
  //   });
  // });
  // describe("When rendering the screen but the profile is someError", () => {
  //   it("A Toast show have been displayed", async () => {
  //     const spiedToastFunction = jest
  //       .spyOn(ToastUtils, "showToast")
  //       .mockImplementationOnce((..._) => undefined);
  //     // eslint-disable-next-line functional/no-let
  //     let maybeWebView: O.Option<WebView> = O.none;
  //     jest
  //       .spyOn(WebView.prototype, "render")
  //       .mockImplementationOnce(function (this: WebView) {
  //         maybeWebView = O.some(this);
  //       });
  //     commonSetup({ profilePotType: "someError" });

  //     expect(maybeWebView).not.toBe(O.none);
  //     const webView = maybeWebView as O.Some<WebView>;

  //     // This is needed otherwise the componentDidUpdate method will not be triggered
  //     await act(() =>
  //       webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
  //     );

  //     // The showToast function should have been called
  //     expect(spiedToastFunction).toHaveBeenCalledWith(
  //       I18n.t("global.genericError")
  //     );
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
  //   it("The ToS acceptance footer should have been rendered", async () => {
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
  //       renderAPI.getByTestId("FooterWithButtons");
  //     expect(footerWithButtonsViewRTI).toBeTruthy();
  //   });
  // });
});

type CurrentTestConfiguration = {
  acceptedToSVersion?: number;
  isProfileFirstOnBoarding?: boolean;
  profilePotType?:
    | "some"
    | "someUpdating"
    | "noneUpdating"
    | "someError"
    | "noneError";
};

const commonSetup = ({
  acceptedToSVersion = CurrentTestToSVersion,
  isProfileFirstOnBoarding = true,
  profilePotType = "some"
}: CurrentTestConfiguration = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const globalProfile = pot.isSome(globalState.profile)
    ? globalState.profile.value
    : ({} as InitializedProfile);
  const testProfile = {
    ...globalProfile,
    accepted_tos_version: acceptedToSVersion,
    email: "john.smith@gmail.com",
    is_email_validated: true,
    service_preferences_settings: {
      mode: isProfileFirstOnBoarding
        ? ServicesPreferencesModeEnum.LEGACY
        : ServicesPreferencesModeEnum.AUTO
    }
  };
  const testProfilePot =
    profilePotType === "someUpdating"
      ? pot.someUpdating(testProfile, testProfile)
      : profilePotType === "noneUpdating"
      ? pot.noneUpdating(testProfile)
      : profilePotType === "someError"
      ? pot.someError(testProfile, new Error(""))
      : profilePotType === "noneError"
      ? pot.noneError(new Error(""))
      : pot.some(testProfile);
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
        tos_version: CurrentTestToSVersion,
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
    profile: testProfilePot
  } as GlobalState;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...testState
  } as GlobalState);

  return renderScreenWithNavigationStoreContext(
    () => <OnboardingTosScreen />,
    ROUTES.ONBOARDING_TOS,
    {},
    store
  );
};

export {};
