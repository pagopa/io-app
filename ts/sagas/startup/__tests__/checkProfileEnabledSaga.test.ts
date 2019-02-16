import { expectSaga } from "redux-saga-test-plan";

import { NonNegativeInteger } from "io-ts-commons/lib/numbers";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "io-ts-commons/lib/strings";
import { getType } from "typesafe-actions";

import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { UserProfile } from "../../../../definitions/backend/UserProfile";

import { startApplicationInitialization } from "../../../store/actions/application";
import { profileUpsert } from "../../../store/actions/profile";

import { checkProfileEnabledSaga } from "../checkProfileEnabledSaga";

describe("checkProfileEnabledSaga", () => {
  const profile: UserProfile = {
    has_profile: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    email: "test@example.com" as EmailString,
    spid_email: "test@example.com" as EmailString,
    family_name: "Connor",
    name: "John",
    fiscal_code: "XYZ" as FiscalCode,
    spid_mobile_phone: "123" as NonEmptyString,
    version: 0 as NonNegativeInteger
  };

  const upsertAction = profileUpsert.request({
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    email: profile.spid_email
  });

  const updatedProfile: InitializedProfile = {
    ...profile,
    version: 1 as NonNegativeInteger
  };

  it("should do nothing if profile is enabled", () => {
    return expectSaga(checkProfileEnabledSaga, profile)
      .not.put.like({ action: { type: getType(profileUpsert.request) } })
      .run();
  });

  it("should create the API profile when the API profile does not exist", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      has_profile: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run();
  });

  it("should update the profile when the inbox is not enabled", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_inbox_enabled: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run();
  });

  it("should update the profile when the webhook is not enabled", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_webhook_enabled: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run();
  });

  it("should update the profile when the email is not set", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      email: undefined
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run();
  });

  it("should restart the app if the profile update fails", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      has_profile: false
    })
      .put(upsertAction)
      .put(startApplicationInitialization())
      .dispatch(profileUpsert.failure(Error()))
      .run();
  });
});
