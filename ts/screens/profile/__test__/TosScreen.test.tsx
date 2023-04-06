import * as React from "react";
import { pot } from "@pagopa/ts-commons";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { act, fireEvent } from "@testing-library/react-native";
import { NavigationAction } from "@react-navigation/native";
import I18n from "i18n-js";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import * as config from "../../../config";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import ROUTES from "../../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import NavigationService from "../../../navigation/NavigationService";
import TosScreen from "../TosScreen";

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
  // This can be removed if we update jest to 29.4+ and switch to jest.replaceProperty
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(config, "zendeskEnabled", {
    value: zendeskEnabledDefaultValue
  });
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(config, "tosVersion", {
    value: tosVersionOriginalValue
  });
});

describe("TosScreen", () => {
  describe("When rendering the screen for an onboarded user", () => {
    it("The back button should be there and pressing it should trigger dispatchNavigationAction(CommonActions.goBack)", () => {
      const spiedFunction = jest
        .spyOn(NavigationService, "dispatchNavigationAction")
        .mockImplementationOnce((_: NavigationAction) => undefined);
      const renderAPI = commonSetup();

      // Back button should be there
      const backButtonRTI = renderAPI.getByTestId("back-button");
      expect(backButtonRTI).toBeDefined();

      // Pressing it should trigger NavigationService.dispatchNavigationAction(CommonActions.goBack())
      fireEvent.press(backButtonRTI);
      expect(spiedFunction).toBeCalledWith({ type: "BACK" });
    });
  });
  describe("When rendering the screen", () => {
    it("The help button is rendered", () => {
      const renderAPI = commonSetup();
      const helpButtonRTI = renderAPI.getByTestId("helpButton");
      expect(helpButtonRTI).toBeDefined();
    });
  });
  describe("When rendering the screen", () => {
    it("The title should have a specific text", () => {
      const renderAPI = commonSetup();
      const textRTI = renderAPI.getByTestId("bodyLabel");
      expect(textRTI.props.children).toEqual(
        I18n.t("profile.main.privacy.privacyPolicy.title")
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
      const renderAPI = commonSetup();

      expect(maybeWebView).not.toBe(O.none);
      const webView = maybeWebView as O.Some<WebView>;

      await act(() =>
        webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
      );

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
  describe("When rendering the screen, the state is loading and there are no state errors", () => {
    it("The ToS acceptance footer should not have been rendered", () => {
      const renderAPI = commonSetup();

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  describe("When rendering the screen, the state is not loading but there are state errors", () => {
    it("The ToS acceptance footer should not have been rendered", async () => {
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

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
  describe("When rendering the screen, the state is not loading and there are no state errors", () => {
    it("The ToS acceptance footer should not have been rendered", async () => {
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

      await act(() =>
        webView.value.props.onLoadEnd?.({} as WebViewNavigationEvent)
      );

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
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
    profile: pot.some(testProfile)
  } as GlobalState;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...testState
  } as GlobalState);

  return renderScreenWithNavigationStoreContext(
    () => <TosScreen />,
    ROUTES.PROFILE_PRIVACY,
    {},
    store
  );
};

export {};
