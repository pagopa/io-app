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
import { UserProfileUnion } from "../../../api/backend";
import { tosVersion } from "../../../config";
import { navigateToTosScreen } from "../../../store/actions/navigation";
import { profileUpsert } from "../../../store/actions/profile";
import { checkAcceptedTosSaga } from "../checkAcceptedTosSaga";

describe("checkAcceptedTosSaga", () => {
  const initialProfile: UserProfileUnion = {
    has_profile: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    email: "test@example.com" as EmailString,
    spid_email: "test@example.com" as EmailString,
    family_name: "Connor",
    name: "John",
    fiscal_code: "XYZ" as FiscalCode,
    spid_mobile_phone: "123" as NonEmptyString,
    version: 1 as NonNegativeInteger
  };

  const notUpdatedProfile: UserProfileUnion = {
    ...initialProfile,
    accepted_tos_version: (tosVersion - 1) as NonNegativeNumber
  };

  const updatedProfile: UserProfileUnion = {
    ...initialProfile,
    accepted_tos_version: tosVersion
  };

  describe("when user has already accepted the last version of ToS", () => {
    it("should should do nothing", () => {
      return expectSaga(checkAcceptedTosSaga, updatedProfile)
        .not.put(navigateToTosScreen)
        .run();
    });
  });

  describe("when user has not already accepted an old version of ToS", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () => {
      return expectSaga(checkAcceptedTosSaga, notUpdatedProfile)
        .put(navigateToTosScreen)
        .take(profileUpsert.request)
        .run();
    });
  });

  describe("when user has not already accepted an old version of ToS", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () => {
      return expectSaga(checkAcceptedTosSaga, initialProfile)
        .put(navigateToTosScreen)
        .take(profileUpsert.request)
        .run();
    });
  });
});
