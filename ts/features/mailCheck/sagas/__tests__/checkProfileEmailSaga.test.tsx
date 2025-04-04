import { View } from "react-native";
import { createStore } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import mockedProfile from "../../../../__mocks__/initializedProfile";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";

import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { checkAcknowledgedEmailSaga } from "../checkAcknowledgedEmailSaga";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";

describe("checkAcknowledgedEmailSaga", () => {
  beforeEach(() => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    renderScreenWithNavigationStoreContext(View, "DUMMY", {}, store);
    jest.useRealTimers();
  });

  describe("when user is on his first onboarding and he has an email and it is not validated", () => {
    const profileEmailValidatedFirstOnboarding = {
      ...mockedProfile,
      is_email_validated: false,
      service_preferences_settings: {
        mode: ServicesPreferencesModeEnum.LEGACY
      }
    };
    it("should prompt the screen to insert it", async () => {
      await expectSaga(
        checkAcknowledgedEmailSaga,
        profileEmailValidatedFirstOnboarding
      )
        .call(NavigationService.navigate, ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
          params: { isOnboarding: true }
        })
        .run();
    });
  });

  describe("when user has not an email", () => {
    const profileWithNoEmail = {
      ...mockedProfile,
      is_email_validated: false,
      email: undefined
    };
    it("should prompt the screen to insert it", async () => {
      await expectSaga(checkAcknowledgedEmailSaga, profileWithNoEmail)
        .call(NavigationService.navigate, ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
          params: { isOnboarding: true }
        })
        .run();
    });
  });
});
