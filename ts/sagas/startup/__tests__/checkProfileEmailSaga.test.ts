import { expectSaga } from "redux-saga-test-plan";

import {
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen
} from "../../../store/actions/navigation";
import {
  emailAcknowledged,
  emailInsert
} from "../../../store/actions/onboarding";
import mockedProfile from "../../../__mocks__/initializedProfile";
import { checkAcknowledgedEmailSaga } from "../checkAcknowledgedEmailSaga";

describe("checkAcceptedTosSaga", () => {
  describe("when user has an email and it is validated", () => {
    it("should do nothing", () =>
      expectSaga(checkAcknowledgedEmailSaga, mockedProfile)
        .not.put(navigateToEmailReadScreen())
        .run());
  });

  describe("when user is on his first onboarding and he has an email and it is validated", () => {
    const profileEmailValidatedFirstOnboarding = {
      ...mockedProfile,
      version: 0
    };
    it("should show email read screen", () =>
      expectSaga(
        checkAcknowledgedEmailSaga,
        profileEmailValidatedFirstOnboarding
      )
        .put(navigateToEmailReadScreen())
        .run());
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
        .put(navigateToEmailReadScreen())
        .dispatch(emailAcknowledged())
        .run());
  });

  describe("when user has not an email", () => {
    const profileWithNoEmail = {
      ...mockedProfile,
      is_email_validated: false,
      email: undefined
    };
    it("should prompt the screen to insert it", () =>
      expectSaga(checkAcknowledgedEmailSaga, profileWithNoEmail)
        .put(navigateToEmailInsertScreen()) // go to email insert screen
        .dispatch(emailInsert()) // dispatch email insert
        .dispatch(navigateToEmailReadScreen()) // navigate to email read screen to remember the user to validate id
        .dispatch(emailAcknowledged()) // press continue
        .run());
  });
});
