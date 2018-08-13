import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { ProfileWithOrWithoutEmail } from "../../api/backend";
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
  profile: ProfileWithOrWithoutEmail
): IterableIterator<Effect> {
  if (
    !profile.has_profile ||
    !profile.is_email_set ||
    !profile.is_inbox_enabled ||
    !profile.is_webhook_enabled
  ) {
    // We have the profile info but the user doesn't yet have an active
    // profile in the CD APIs.
    // NOTE: `has_profile` is a boolean that is true if the profile is
    // active in the API.

    // Upsert the user profile to enable inbox and webhook
    // FIXME: make this a call to the profileUpsert saga
    yield put(
      profileUpsertRequest({
        is_inbox_enabled: true,
        is_webhook_enabled: true,
        email: profile.spid_email
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
      yield put(startApplicationInitialization);
    }
  }
}
