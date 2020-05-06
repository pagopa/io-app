import { expectSaga } from "redux-saga-test-plan";

import {
  NonNegativeInteger,
  NonNegativeNumber
} from "italia-ts-commons/lib/numbers";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { tosVersion } from "../../../config";
import { navigateToTosScreen } from "../../../store/actions/navigation";
import { tosAccepted } from "../../../store/actions/onboarding";
import { isProfileFirstOnBoarding } from "../../../store/reducers/profile";
import { checkAcceptedTosSaga } from "../checkAcceptedTosSaga";

describe("checkAcceptedTosSaga", () => {
  const firstOnboardingProfile: InitializedProfile = {
    has_profile: false,
    is_email_enabled: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    version: 0 as NonNegativeInteger,
    spid_email: "test@example.com" as EmailString,
    family_name: "Connor",
    name: "John",
    fiscal_code: "XYZ" as FiscalCode,
    spid_mobile_phone: "123" as NonEmptyString
  };

  const oldOnboardedProfile: InitializedProfile = {
    has_profile: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    is_email_enabled: false,
    email: "test@example.com" as EmailString,
    spid_email: "test@example.com" as EmailString,
    family_name: "Connor",
    name: "John",
    fiscal_code: "XYZ" as FiscalCode,
    spid_mobile_phone: "123" as NonEmptyString,
    version: 1 as NonNegativeInteger
  };

  const notUpdatedProfile: InitializedProfile = {
    ...oldOnboardedProfile,
    accepted_tos_version: (tosVersion - 1) as NonNegativeNumber
  };

  const updatedProfile: InitializedProfile = {
    ...oldOnboardedProfile,
    accepted_tos_version: tosVersion
  };

  describe("when a profile is first time onboarded", () => {
    it("should be true", () => {
      expect(isProfileFirstOnBoarding(firstOnboardingProfile)).toBeTruthy();
    });

    it("should be false", () => {
      expect(isProfileFirstOnBoarding(oldOnboardedProfile)).toBeFalsy();
    });
  });

  describe("when user has already accepted the last version of ToS", () => {
    it("should do nothing", () => {
      return expectSaga(checkAcceptedTosSaga, updatedProfile)
        .not.put(navigateToTosScreen)
        .run();
    });
  });

  describe("when user has accepted ToS before its version was persisted", () => {
    it("should do nothing", () => {
      return expectSaga(checkAcceptedTosSaga, oldOnboardedProfile)
        .not.put(navigateToTosScreen)
        .run();
    });
  });

  describe("when user has accepted an old version of ToS", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () => {
      return expectSaga(checkAcceptedTosSaga, notUpdatedProfile)
        .put(navigateToTosScreen)
        .take(tosAccepted)
        .run();
    });
  });

  describe("when user has never accepted an ToS because he is accessing the app for the first time", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () => {
      return expectSaga(checkAcceptedTosSaga, firstOnboardingProfile)
        .put(navigateToTosScreen)
        .take(tosAccepted)
        .run();
    });
  });
});
