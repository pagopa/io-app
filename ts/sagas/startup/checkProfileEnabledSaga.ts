import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { Profile } from "../../../definitions/backend/Profile";
import { startApplicationInitialization } from "../../store/actions/application";
import {
  PROFILE_UPSERT_FAILURE,
  PROFILE_UPSERT_SUCCESS
} from "../../store/actions/constants";
import {
  ProfileUpsertFailure,
  profileUpsertRequest,
  ProfileUpsertSuccess
} from "../../store/actions/profile";

export function* checkProfileEnabledSaga(
  profile: Profile
): IterableIterator<Effect> {
  if (
    !profile.extended ||
    !profile.extended.email ||
    !profile.extended.is_inbox_enabled ||
    !profile.extended.is_webhook_enabled
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
        email: profile.spid.spid_email
      })
    );
    const action: ProfileUpsertSuccess | ProfileUpsertFailure = yield take([
      PROFILE_UPSERT_SUCCESS,
      PROFILE_UPSERT_FAILURE
    ]);
    // We got an error
    if (action.type === PROFILE_UPSERT_FAILURE) {
      // Restart the initialization loop to let the user retry.
      // FIXME: show an error message
      yield put(startApplicationInitialization());
    }
  }
}
