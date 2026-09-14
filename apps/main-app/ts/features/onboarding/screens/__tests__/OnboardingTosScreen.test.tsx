import { ToolEnum } from "@io-app/api-types/generated/definitions/content/AssistanceToolConfig";
import { InitializedProfile } from "@io-app/api-types/generated/definitions/identity/InitializedProfile";
import { ServicesPreferencesModeEnum } from "@io-app/api-types/generated/definitions/identity/ServicesPreferencesMode";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import OnboardingTosScreen from "../OnboardingTosScreen";

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
  describe("When rendering the screen, the state is loading and there are no state errors", () => {
    it("The ToS acceptance footer should not have been rendered", () => {
      const renderAPI = commonSetup();

      const footerWithButtonsViewRTI =
        renderAPI.queryByTestId("FooterWithButtons");
      expect(footerWithButtonsViewRTI).toBeFalsy();
    });
  });
});

type CurrentTestConfiguration = {
  acceptedToSVersion?: number;
  isProfileFirstOnBoarding?: boolean;
  profilePotType?:
    | "noneError"
    | "noneUpdating"
    | "some"
    | "someError"
    | "someUpdating";
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
