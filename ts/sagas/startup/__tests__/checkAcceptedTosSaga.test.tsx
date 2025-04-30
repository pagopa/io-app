import { expectSaga } from "redux-saga-test-plan";
import {
  NonNegativeInteger,
  NonNegativeNumber
} from "@pagopa/ts-commons/lib/numbers";
import { select } from "redux-saga/effects";
import { navigateToTosScreen } from "../../../store/actions/navigation";
import { tosAccepted } from "../../../features/onboarding/store/actions";
import { isProfileFirstOnBoarding } from "../../../features/settings/common/store/utils/guards";
import mockedProfile from "../../../__mocks__/initializedProfile";
import { checkAcceptedTosSaga } from "../checkAcceptedTosSaga";
import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";
import { tosConfigSelector } from "../../../features/tos/store/selectors";

const tosVersion = 3.2 as NonNegativeNumber;

describe("checkAcceptedTosSaga", () => {
  const firstOnboardingProfile = {
    ...mockedProfile,
    has_profile: false,
    is_email_enabled: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    version: 0 as NonNegativeInteger,
    service_preferences_settings: {
      mode: ServicesPreferencesModeEnum.LEGACY
    }
  };

  const oldOnboardedProfile = {
    ...mockedProfile,
    has_profile: true,
    is_email_enabled: false,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    version: 1 as NonNegativeInteger
  };

  const notUpdatedProfile = {
    ...oldOnboardedProfile,
    accepted_tos_version: (tosVersion - 1) as NonNegativeNumber
  };

  const updatedProfile = {
    ...oldOnboardedProfile,
    accepted_tos_version: tosVersion
  };

  beforeEach(() => {
    jest.useRealTimers();
  });

  describe("when a profile is first time onboarded", () => {
    it("should be true", () => {
      expect(isProfileFirstOnBoarding(firstOnboardingProfile)).toBeTruthy();
    });

    it("should be false", () => {
      expect(isProfileFirstOnBoarding(oldOnboardedProfile)).toBeFalsy();
    });
  });

  describe("when user has already accepted the last version of ToS", () => {
    it("should do nothing", () =>
      expectSaga(checkAcceptedTosSaga, updatedProfile)
        .provide([[select(tosConfigSelector), { tos_version: tosVersion }]])
        .not.call(navigateToTosScreen)
        .run());
  });

  describe("when user has not accepted ToS", () => {
    it("should navigate to ToS screen", () =>
      expectSaga(checkAcceptedTosSaga, {
        ...oldOnboardedProfile,
        accepted_tos_version: undefined
      })
        .provide([[select(tosConfigSelector), { tos_version: tosVersion }]])
        .call(navigateToTosScreen)
        .run());
  });

  describe("when user has accepted an old version of ToS", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () =>
      expectSaga(checkAcceptedTosSaga, notUpdatedProfile)
        .provide([[select(tosConfigSelector), { tos_version: tosVersion }]])
        .call(navigateToTosScreen)
        .take(tosAccepted)
        .run());
  });

  describe("when user has never accepted an ToS because he is accessing the app for the first time", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () =>
      expectSaga(checkAcceptedTosSaga, firstOnboardingProfile)
        .provide([[select(tosConfigSelector), { tos_version: tosVersion }]])
        .call(navigateToTosScreen)
        .take(tosAccepted)
        .run());
  });
});
