import { expectSaga } from "redux-saga-test-plan";

import { ProfileWithOrWithoutEmail } from "../../../api/backend";

import { startApplicationInitialization } from "../../../store/actions/application";
import {
  profileUpsertFailure,
  profileUpsertRequest,
  profileUpsertSuccess
} from "../../../store/actions/profile";

import { checkProfileEnabledSaga } from "../checkProfileEnabledSaga";

describe("checkProfileEnabledSaga", () => {
  const profile: ProfileWithOrWithoutEmail = {
    has_profile: true,
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    is_email_set: true,
    spid_email: "test@example.com"
  } as any;

  const upsertAction = profileUpsertRequest({
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    email: profile.spid_email
  });

  it("should do nothing if profile is enabled", () => {
    return expectSaga(checkProfileEnabledSaga, profile)
      .not.put(upsertAction)
      .run();
  });

  it("should update the profile when the API profile does not exist", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      has_profile: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization)
      .dispatch(profileUpsertSuccess(profile))
      .run();
  });

  it("should update the profile when the inbox is not enabled", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_inbox_enabled: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization)
      .dispatch(profileUpsertSuccess(profile))
      .run();
  });

  it("should update the profile when the webhook is not enabled", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_webhook_enabled: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization)
      .dispatch(profileUpsertSuccess(profile))
      .run();
  });

  it("should update the profile when the email is not set", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      is_email_set: false
    })
      .put(upsertAction)
      .not.put(startApplicationInitialization)
      .dispatch(profileUpsertSuccess(profile))
      .run();
  });

  it("should restart the app if the profile update fails", () => {
    return expectSaga(checkProfileEnabledSaga, {
      ...profile,
      has_profile: false
    })
      .put(upsertAction)
      .put(startApplicationInitialization)
      .dispatch(profileUpsertFailure(Error()))
      .run();
  });
});
