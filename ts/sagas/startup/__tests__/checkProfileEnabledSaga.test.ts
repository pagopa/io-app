import { expectSaga } from "redux-saga-test-plan";

import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import {
  EmailString,
  FiscalCode,
  NonEmptyString
} from "italia-ts-commons/lib/strings";
import { getType } from "typesafe-actions";

import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";

import { startApplicationInitialization } from "../../../store/actions/application";
import { profileUpsert } from "../../../store/actions/profile";

import { checkProfileEnabledSaga } from "../checkProfileEnabledSaga";

describe("checkProfileEnabledSaga", () => {
  const profile: InitializedProfile = {
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
    version: 0 as NonNegativeInteger
  };

  const upsertAction = profileUpsert.request({
    is_inbox_enabled: true,
    is_webhook_enabled: true
  });

  const updatedProfile: InitializedProfile = {
    ...profile,
    is_email_enabled: false,
    is_inbox_enabled: false,
    is_webhook_enabled: false,
    version: 1 as NonNegativeInteger
  };

  it("should enable inbox if tos version is not defined or 0", () =>
    expectSaga(checkProfileEnabledSaga, updatedProfile)
      .put.like({ action: { type: getType(profileUpsert.request) } })
      .run());

  it("should enable inbox if it's disabled and tos version > 1", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...updatedProfile,
      accepted_tos_version: 3
    })
      .put.like({ action: { type: getType(profileUpsert.request) } })
      .run());

  it("should not update profile if inbox is enabled and user accepted tos", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...updatedProfile,
      is_inbox_enabled: true,
      accepted_tos_version: 3
    })
      .not.put.like({ action: { type: getType(profileUpsert.request) } })
      .run());

  it("should create the API profile when the API profile does not exist", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_inbox_enabled: false,
      is_webhook_enabled: false,
      email: undefined
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run());

  it("should update the profile when the inbox is not enabled", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_inbox_enabled: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run());

  it("should update the profile when the webhook is not enabled", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_webhook_enabled: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run());

  it("should update the profile when the email is not set", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...profile,
      email: undefined
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization())
      .dispatch(profileUpsert.success(updatedProfile))
      .run());

  it("should restart the app if the profile update fails", () =>
    expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_inbox_enabled: false,
      is_webhook_enabled: false,
      email: undefined
    })
      .put(upsertAction)
      .put(startApplicationInitialization())
      .dispatch(profileUpsert.failure(Error()))
      .run());
});
