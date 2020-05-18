import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { startApplicationInitialization } from "../../store/actions/application";
import { profileFirstLogin, profileUpsert } from "../../store/actions/profile";

export function* checkProfileEnabledSaga(
  profile: InitializedProfile
): IterableIterator<Effect> {
  if (
    !profile.has_profile ||
    !profile.email ||
    !profile.is_inbox_enabled ||
    !profile.is_webhook_enabled
  ) {
    // NOTE: `has_profile` is a boolean that is true if the profile is
    // active in the API.
    // FIXME: the `version` field has the same meaning at the `has_profile`
    //        field, we should get rid of `has_profile`.
    //        see https://github.com/pagopa/io-backend/blob/v0.0.48/src/types/profile.ts#L33

    // Upsert the user profile to enable inbox and webhook
    yield put(
      profileUpsert.request({
        is_inbox_enabled: true,
        is_webhook_enabled: true
      })
    );
    const action:
      | ActionType<typeof profileUpsert["success"]>
      | ActionType<typeof profileUpsert["failure"]> = yield take([
      getType(profileUpsert.success),
      getType(profileUpsert.failure)
    ]);
    // We got an error
    if (action.type === getType(profileUpsert.failure)) {
      // Restart the initialization loop to let the user retry.
      // FIXME: show an error message
      yield put(startApplicationInitialization());
    } else {
      // First time login
      if (profile.version === 0) {
        yield put(profileFirstLogin());
      }
    }
  }
}
