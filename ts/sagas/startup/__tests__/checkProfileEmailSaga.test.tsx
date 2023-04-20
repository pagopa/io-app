import { View } from "react-native";
import { createStore } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import mockedProfile from "../../../__mocks__/initializedProfile";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";

import { navigateToEmailReadScreen } from "../../../store/actions/navigation";
import {
  emailAcknowledged,
  emailInsert
} from "../../../store/actions/onboarding";
import { appReducer } from "../../../store/reducers";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { checkAcknowledgedEmailSaga } from "../checkAcknowledgedEmailSaga";

describe("checkAcknowledgedEmailSaga", () => {
  beforeEach(() => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    renderScreenFakeNavRedux(View, "DUMMY", {}, store);
    jest.useRealTimers();
  });

  describe("when user has an email and it is validated", () => {
    it("should do nothing", () =>
      expectSaga(checkAcknowledgedEmailSaga, mockedProfile)
        .not.call(navigateToEmailReadScreen)
        .run());
  });

  describe("when user is on his first onboarding and he has an email and it is validated", () => {
    const profileEmailValidatedFirstOnboarding = {
      ...mockedProfile,
      version: 0
    };
    it("should show email read screen", async () => {
      await expectSaga(
        checkAcknowledgedEmailSaga,
        profileEmailValidatedFirstOnboarding
      )
        .call(NavigationService.navigate, ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_READ_EMAIL_SCREEN
        })
        .run();
    });
  });

  describe("when user has an email and it not is validated", () => {
    const profileWithEmailNotValidated = {
      ...mockedProfile,
      is_email_validated: false
    };
    it("should prompt the screen to remember to validate", () =>
      expectSaga(checkAcknowledgedEmailSaga, profileWithEmailNotValidated)
        // read screen is wrapped in a HOC where if email is validate show ReadScreen
        // otherwise a screen that remembers to validate it
        .call(NavigationService.navigate, ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_READ_EMAIL_SCREEN
        })
        .dispatch(emailAcknowledged())
        .run());
  });

  describe("when user has not an email", () => {
    const profileWithNoEmail = {
      ...mockedProfile,
      is_email_validated: false,
      email: undefined
    };
    it("should prompt the screen to insert it", async () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      renderScreenFakeNavRedux(View, "DUMMY", {}, store);
      await expectSaga(checkAcknowledgedEmailSaga, profileWithNoEmail)
        .call(NavigationService.navigate, ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN
        }) // go to email insert screen
        .dispatch(emailInsert()) // dispatch email insert
        .dispatch(emailAcknowledged()) // press continue
        .run();
    });
  });
});
