import { expectSaga } from "redux-saga-test-plan";

import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { Version } from "../../../../definitions/backend/Version";
import {
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen
} from "../../../store/actions/navigation";
import {
  emailAcknowledged,
  emailInsert
} from "../../../store/actions/onboarding";
import { checkAcknowledgedEmailSaga } from "../checkAcknowledgedEmailSaga";

const userProfileWithEmailAndValidated: InitializedProfile = {
  has_profile: true,
  is_inbox_enabled: true,
  is_webhook_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  email: "test@example.com" as EmailString,
  spid_email: "test@example.com" as EmailString,
  family_name: "Connor",
  name: "John",
  fiscal_code: "ABCDEF83A12L719R" as FiscalCode,
  spid_mobile_phone: "123" as NonEmptyString,
  version: 1 as Version
};

describe("checkAcceptedTosSaga", () => {
  describe("when user has an email and it is validated", () => {
    it("should do nothing", () => {
      return expectSaga(
        checkAcknowledgedEmailSaga,
        userProfileWithEmailAndValidated
      )
        .not.put(navigateToEmailReadScreen())
        .run();
    });
  });

  describe("when user is on his first onboarding and he has an email and it is validated", () => {
    const profileEmailValidatedFirstOnboarding: InitializedProfile = {
      ...userProfileWithEmailAndValidated,
      version: 0
    };
    it("should show email read screen", () => {
      return expectSaga(
        checkAcknowledgedEmailSaga,
        profileEmailValidatedFirstOnboarding
      )
        .put(navigateToEmailReadScreen())
        .run();
    });
  });

  describe("when user has an email and it not is validated", () => {
    const profileWithEmailNotValidated: InitializedProfile = {
      ...userProfileWithEmailAndValidated,
      is_email_validated: false
    };
    it("should prompt the screen to remember to validate", () => {
      return (
        expectSaga(checkAcknowledgedEmailSaga, profileWithEmailNotValidated)
          // read screen is wrapped in a HOC where if email is validate show ReadScreen
          // otherwise a screen that remembers to validate it
          .put(navigateToEmailReadScreen())
          .dispatch(emailAcknowledged())
          .run()
      );
    });
  });

  describe("when user has not an email", () => {
    const profileWithNoEmail: InitializedProfile = {
      ...userProfileWithEmailAndValidated,
      is_email_validated: false,
      email: undefined
    };
    it("should prompt the screen to insert it", () => {
      return expectSaga(checkAcknowledgedEmailSaga, profileWithNoEmail)
        .put(navigateToEmailInsertScreen()) // go to email insert screen
        .dispatch(emailInsert()) // dispatch email insert
        .dispatch(navigateToEmailReadScreen()) // navigate to email read screen to remember the user to validate id
        .dispatch(emailAcknowledged()) // press continue
        .run();
    });
  });
});
