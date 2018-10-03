import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { UserProfileUnion } from "../../api/backend";
import { startApplicationInitialization } from "../../store/actions/application";
import {
  profileUpsertFailure,
  profileUpsertRequest,
  profileUpsertSuccess
} from "../../store/actions/profile";

export function* checkProfileEnabledSaga(
  profile: UserProfileUnion
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
    //        see https://github.com/teamdigitale/italia-backend/blob/v0.0.48/src/types/profile.ts#L33

    // Upsert the user profile to enable inbox and webhook
    yield put(
      profileUpsertRequest({
        is_inbox_enabled: true,
        is_webhook_enabled: true,
        email: profile.spid_email
      })
    );
    const action: ActionType<
      typeof profileUpsertSuccess | typeof profileUpsertFailure
    > = yield take([
      getType(profileUpsertSuccess),
      getType(profileUpsertFailure)
    ]);
    // We got an error
    if (action.type === getType(profileUpsertFailure)) {
      // Restart the initialization loop to let the user retry.
      // FIXME: show an error message
      yield put(startApplicationInitialization());
    }
  }
}
