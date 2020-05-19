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
    profile.version === 0 ||
    !profile.email ||
    !profile.is_inbox_enabled ||
    !profile.is_webhook_enabled
  ) {
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
