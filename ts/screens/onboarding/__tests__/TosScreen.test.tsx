import * as React from "react";
import { pot } from "@pagopa/ts-commons";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { NavigationAction } from "@react-navigation/native";
import { Alert, AlertButton } from "react-native";
import I18n from "i18n-js";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import TosScreen from "../TosScreen";
import * as config from "../../../config";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import ROUTES from "../../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../../ts/utils/testWrapper";
import * as customNavigation from "../../../../ts/utils/navigation";
import NavigationService from "../../../../ts/navigation/NavigationService";
import brokenLinkImage from "../../../../img/broken-link.png";
import * as ToastUtils from "../../../utils/showToast";

const CurrentTestZendeskEnabled = true;
const CurrentTestToSVersion = 2.0;

const zendeskEnabledDefaultValue = config.zendeskEnabled;
const tosVersionOriginalValue = config.tosVersion;

// Restore defineProperty
beforeAll(() => {
  jest.resetAllMocks();
  jest.mock("./../../../config");
  // This can be replaced by jest.replaceProperty if we update jest to 29.4+
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(config, "zendeskEnabled", {
    value: CurrentTestZendeskEnabled
  });
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(config, "tosVersion", { value: CurrentTestToSVersion });
});

afterAll(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
  // This can be removed if we update jest to 29.4+ and switch to jest.replaceProperty
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(config, "zendeskEnabled", {
    value: zendeskEnabledDefaultValue
  });
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(config, "tosVersion", {
    value: tosVersionOriginalValue
  });
  console.log(
    `=== (${zendeskEnabledDefaultValue}) (${tosVersionOriginalValue})`
  );
});

describe("TosScreen", () => {
  describe("When rendering the screen for an onboarded user", () => {
    it("The back button should be there and pressing it should trigger dispatchNavigationAction(CommonActions.goBack)", () => {
      const spiedFunction = jest
        .spyOn(NavigationService, "dispatchNavigationAction")
        .mockImplementationOnce((_: NavigationAction) => undefined);
      const renderAPI = commonSetup({ isOnboardingRoute: false });

      // Back button should be there
      const backButtonRTI = renderAPI.getByTestId("back-button");
      expect(backButtonRTI).toBeDefined();

      // Pressing it should trigger NavigationService.dispatchNavigationAction(CommonActions.goBack())
      fireEvent.press(backButtonRTI);
      expect(spiedFunction).toBeCalledWith({ type: "GO_BACK" });
    });
  });
  describe("When rendering the screen for a new user", () => {
    it("The back button should be there and pressing it should display the Alert", () => {
      const spiedAlert = jest.spyOn(Alert, "alert");
      const renderAPI = commonSetup();

      // Back button should be there
      const backButtonRTI = renderAPI.getByTestId("back-button");
      expect(backButtonRTI).toBeDefined();

      // Pressing it should display an Alert
      fireEvent.press(backButtonRTI);
      // Alert was called
      expect(spiedAlert.mock.calls).toHaveLength(1);
      // Alert.alert was given a title, a description and an array of buttons
      expect(spiedAlert.mock.calls[0]).toHaveLength(3);
      // Title correctness
      expect(spiedAlert.mock.calls[0][0]).toBe(
        I18n.t("onboarding.alert.title")
      );
      // Description correctness
      expect(spiedAlert.mock.calls[0][1]).toBe(
        I18n.t("onboarding.alert.description")
      );
      // Two buttons were given
      const buttonsObject = spiedAlert.mock.calls[0][2] as Array<AlertButton>;
      expect(buttonsObject).toBeTruthy();
      expect(buttonsObject!.length).toBe(2);
      // First button correctness
      const firstButtonJsonObject = buttonsObject[0];
      expect(firstButtonJsonObject).toStrictEqual({
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      });
      // Second button correctness
      const secondButtonJsonObject = buttonsObject[1];
      const secondButtonText = secondButtonJsonObject.text;
      expect(secondButtonText).toBe(I18n.t("global.buttons.exit"));
      const secondButtonStyle = secondButtonJsonObject.style;
      expect(secondButtonStyle).toBe("default");
      const secondButtononPress = secondButtonJsonObject.onPress;
      expect(secondButtononPress).toBeDefined();
    });
  });
  describe("When rendering the screen", () => {
    it("The help button is rendered", () => {
      const renderAPI = commonSetup();
      const helpButtonRTI = renderAPI.getByTestId("helpButton");
      expect(helpButtonRTI).toBeDefined();
    });
  });
  describe("When rendering the screen for an oboarded user", () => {
    it("The title should have a specific text", () => {
      const renderAPI = commonSetup({ isOnboardingRoute: false });
      const textRTI = renderAPI.getByTestId("bodyLabel");
      expect(textRTI.props.children).toEqual(
        I18n.t("profile.main.privacy.privacyPolicy.title")
      );
    });
  });
  describe("When rendering the screen for a new user", () => {
    it("The title should have a specific text", () => {
      const renderAPI = commonSetup();
      const textRTI = renderAPI.getByTestId("bodyLabel");
      expect(textRTI.props.children).toEqual(
        I18n.t("onboarding.tos.headerTitle")
      );
    });
  });
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
        acceptedToSVersion: CurrentTestToSVersion - 0.1
      });
      const textRTI = renderAPI.getByTestId("currentToSNotAcceptedText");
      expect(textRTI.props.children).toEqual(
        I18n.t("profile.main.privacy.privacyPolicy.infobox")
      );
    });
  });
  describe("When rendering the screen for an user that has not accepted the current ToS version and has not completed the onboarding", () => {
    it("The informative header should have a specific text", () => {
      const renderAPI = commonSetup({
        acceptedToSVersion: CurrentTestToSVersion - 0.1,
        isProfileFirstOnBoarding: false
      });
      const textRTI = renderAPI.getByTestId("currentToSNotAcceptedText");
      expect(textRTI.props.children).toEqual(
        I18n.t("profile.main.privacy.privacyPolicy.updated")
      );
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
  describe("When rendering the screen after the WebView has finished loading without any error", () => {
    it("The TosWebviewComponent should be rendered without any loading spinner overlayed", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const renderAPI = commonSetup({});

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

      // Overlay component should be there (since the top view is rendered nonetheless)
      const overlayComponentRTI = renderAPI.getByTestId("overlayComponent");
      expect(overlayComponentRTI).toBeTruthy();

      // There must not be the indeterminate spinner
      const activityIndicatorRTI = renderAPI.queryByTestId("refreshIndicator");
      expect(activityIndicatorRTI).toBeFalsy();

      // TosWebviewComponent should be rendered
      const webViewComponentRTI = renderAPI.getByTestId("toSWebViewContainer");
      expect(webViewComponentRTI).toBeTruthy();
    });
  });
  describe("When rendering the screen after the WebView has finished loading without any error but the profile is someUpdating", () => {
    it("There should be the loading spinner overlay without the cancel button", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const renderAPI = commonSetup({ profilePotType: "someUpdating" });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

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
  describe("When rendering the screen after the WebView has finished loading without any error but the profile is noneUpdating", () => {
    it("There should be the loading spinner overlay without the cancel button", async () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const renderAPI = commonSetup({ profilePotType: "noneUpdating" });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

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
  describe("When rendering the screen and there is an error", () => {
    it("The error overlay should have been rendered with proper values and the web view should not have been rendered", () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const renderAPI = commonSetup({});

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onError?.({} as WebViewErrorEvent);

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
  });
  describe("When rendering the screen and there is an error", () => {
    it("Pressing the retry button should update the component state", async () => {
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

      webView.value.props.onError?.({} as WebViewErrorEvent);

      // Retry button should be rendered
      const errorContainerButtonRTI = renderAPI.getByTestId(
        "toSErrorContainerButton"
      );
      expect(errorContainerButtonRTI).toBeDefined();

      // Fire the retry button
      fireEvent.press(errorContainerButtonRTI);

      // Error container should not be rendered
      const errorContainerViewRTI = renderAPI.queryByTestId(
        "toSErrorContainerView"
      );
      expect(errorContainerViewRTI).toBeFalsy();

      // TosWebviewComponent should be rendered
      const webViewComponentRTI = renderAPI.getByTestId("toSWebViewContainer");
      expect(webViewComponentRTI).toBeTruthy();
    });
  });
  describe("When rendering the screen but the profile is someError", () => {
    it("A Toast show have been displayed", async () => {
      const spiedToastFunction = jest
        .spyOn(ToastUtils, "showToast")
        .mockImplementationOnce((..._) => undefined);
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      commonSetup({ profilePotType: "someError" });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      // This is needed otherwise the componentDidUpdate method will not be triggered
      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

      // The showToast function should have been called
      expect(spiedToastFunction).toHaveBeenCalledWith(
        I18n.t("global.genericError")
      );
    });
  });
  describe("When rendering the screen on the onboarding flow, the state is not loading and there are no state errors", () => {
    it("The ToS acceptance footer should have been rendered", () => {
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

      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

      const footerWithButtonsViewRTI =
        renderAPI.getByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeTruthy();
    });
  });
  describe("When rendering the screen on the onboarding flow, the state is not loading but there are state errors", () => {
    it("The ToS acceptance footer should not have been rendered", () => {
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

      webView.value.props.onError?.({} as WebViewErrorEvent);

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  describe("When rendering the screen on the onboarding flow, the state is loading and there are no state errors", () => {
    it("The ToS acceptance footer should not have been rendered", () => {
      const renderAPI = commonSetup();

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  describe("When rendering the screen, not from the onboarding flow, the state is not loading and there are no state errors", () => {
    it("The ToS acceptance footer should have been rendered", () => {
      // eslint-disable-next-line functional/no-let
      let maybeWebView: O.Option<WebView> = O.none;
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          maybeWebView = O.some(this);
        });
      const renderAPI = commonSetup({ isOnboardingRoute: false });

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent);

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
});

type CurrentTestConfiguration = {
  acceptedToSVersion?: number;
  isOnboardingRoute?: boolean;
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
  isOnboardingRoute = true,
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
    version: isProfileFirstOnBoarding ? 0 : 1,
    email: "john.smith@gmail.com",
    is_email_validated: true
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
    backendStatus: {
      ...globalState.backendStatus,
      status: O.some({
        config: {
          assistanceTool: {
            tool: ToolEnum.zendesk
          },
          cgn: {
            enabled: false
          },
          fims: {
            enabled: false
          }
        }
      })
    },
    profile: testProfilePot
  } as GlobalState;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...testState
  } as GlobalState);

  jest
    .spyOn(customNavigation, "isOnboardingCompleted")
    .mockReturnValue(!isOnboardingRoute);

  return renderScreenWithNavigationStoreContext(
    () => <TosScreen />,
    ROUTES.ONBOARDING_TOS,
    {},
    store
  );
};

export {};
