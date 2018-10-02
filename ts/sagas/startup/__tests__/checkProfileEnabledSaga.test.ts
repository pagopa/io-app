import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { expectSaga } from "redux-saga-test-plan";

import { ExtendedProfile } from "../../../../definitions/backend/ExtendedProfile";
import { Profile } from "../../../../definitions/backend/Profile";
import { startApplicationInitialization } from "../../../store/actions/application";
import { PROFILE_UPSERT_REQUEST } from "../../../store/actions/constants";
import {
  profileUpsertFailure,
  profileUpsertRequest,
  profileUpsertSuccess
} from "../../../store/actions/profile";
import { checkProfileEnabledSaga } from "../checkProfileEnabledSaga";

describe("checkProfileEnabledSaga", () => {
  const profile: Profile = {
    spid: {
      family_name: "Connor",
      fiscal_code: "XYZ" as FiscalCode,
      name: "John",
      spid_email: "test@example.com" as EmailString,
      spid_mobile_phone: "123" as NonEmptyString
    },
    extended: {
      email: "test@example.com" as EmailString,
      is_inbox_enabled: true,
      is_webhook_enabled: true,
      version: 0 as NonNegativeInteger
    }
  };

  const upsertAction = profileUpsertRequest({
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    email: profile.spid.spid_email
  });

  const updatedProfile: Profile = {
    spid: { ...profile.spid },
    extended: {
      ...profile.extended,
      version: 0 as NonNegativeInteger
    } as ExtendedProfile
  };

  it("should do nothing if profile is enabled", () => {
    return expectSaga(checkProfileEnabledSaga, profile)
      .not.put.like({ action: { type: PROFILE_UPSERT_REQUEST } })
      .run();
  });

  it("should create the API profile when the API profile does not exist", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      extended: undefined
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsertSuccess(updatedProfile))
      .run();
  });

  it("should update the profile when the inbox is not enabled", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      extended: {
        ...profile.extended,
        is_inbox_enabled: false
      } as ExtendedProfile
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsertSuccess(updatedProfile))
      .run();
  });

  it("should update the profile when the webhook is not enabled", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      extended: {
        ...profile.extended,
        is_webhook_enabled: false
      } as ExtendedProfile
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsertSuccess(updatedProfile))
      .run();
  });

  it("should update the profile when the email is not set", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      extended: {
        ...profile.extended,
        email: undefined
      } as ExtendedProfile
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsertSuccess(updatedProfile))
      .run();
  });

  it("should restart the app if the profile update fails", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      extended: undefined
    })
      .put(upsertAction)
      .put(startApplicationInitialization())
      .dispatch(profileUpsertFailure(Error()))
      .run();
  });
});
