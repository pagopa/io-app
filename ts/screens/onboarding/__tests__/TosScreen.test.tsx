import * as React from "react";
import { pot } from "@pagopa/ts-commons";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { NavigationAction } from "@react-navigation/native";
import { Alert, AlertButton } from "react-native";
import I18n from "i18n-js";
import WebView from "react-native-webview";
import { WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";
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
/* const defaultState = {
  backendStatus: {
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
  navigation: {
    currentRoute: ROUTES.ONBOARDING_TOS
  },
  persistedPreferences: {
    isPagoPATestEnabled: false
  },
  profile: pot.some({
    accepted_tos_version: 4.4,
    version: 0,
    email: "john.smith@gmail.com",
    is_email_validated: true
  }),
  search: {
    isSearchEnabled: true
  }
}; */

const CurrentTestZendeskEnabled = true;
const CurrentTestToSVersion = 2.0;

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
      expect(spiedFunction).toBeCalledWith({ type: "GO_BACK" });
    });
  });
  describe("When rendering the screen for a new user", () => {
    it("The back button should be there and pressing it should display the Alert", () => {
      const spiedAlert = jest.spyOn(Alert, "alert");
      const renderAPI = commonSetup({ isOnboardingRoute: false });

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
      const renderAPI = commonSetup();
      const textRTI = renderAPI.getByTestId("bodyLabel");
      expect(textRTI.props.children).toEqual(
        I18n.t("profile.main.privacy.privacyPolicy.title")
      );
    });
  });
  describe("When rendering the screen for a new user", () => {
    it("The title should have a specific text", () => {
      const renderAPI = commonSetup({ isOnboardingRoute: false });
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
  describe("When rendering the screen and there is an error", () => {
    it("The error overlay should have been rendered with proper values and the web view should not have been rendered", () => {
      jest
        .spyOn(WebView.prototype, "render")
        .mockImplementationOnce(function (this: WebView) {
          this.props.onError?.({} as WebViewErrorEvent);
        });
      const renderAPI = commonSetup({});

      // Render container should be there
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
        "toSWebViewComponent"
      );
      expect(webViewComponentRTI).toBeFalsy();
    });
  });
});

type CurrentTestConfiguration = {
  acceptedToSVersion?: number;
  isOnboardingRoute?: boolean;
  isProfileFirstOnBoarding?: boolean;
};

const commonSetup = ({
  acceptedToSVersion = CurrentTestToSVersion,
  isOnboardingRoute = true,
  isProfileFirstOnBoarding = true
}: CurrentTestConfiguration = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const globalProfile = pot.isSome(globalState.profile)
    ? globalState.profile.value
    : ({} as InitializedProfile);
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
    profile: pot.some({
      ...globalProfile,
      accepted_tos_version: acceptedToSVersion,
      version: isProfileFirstOnBoarding ? 0 : 1,
      email: "john.smith@gmail.com",
      is_email_validated: true
    })
  } as GlobalState;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...testState
  } as GlobalState);

  jest
    .spyOn(customNavigation, "isOnboardingCompleted")
    .mockReturnValue(isOnboardingRoute);

  return renderScreenWithNavigationStoreContext(
    () => <TosScreen />,
    ROUTES.ONBOARDING_TOS,
    {},
    store
  );
};

export {};
