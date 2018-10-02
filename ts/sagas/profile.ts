/**
 * A saga that manages the Profile.
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Profile } from "../../definitions/backend/Profile";
import {
  GetUserProfileT,
  UpsertProfileT
} from "../../definitions/backend/requestTypes";
import I18n from "../i18n";
import { sessionExpired } from "../store/actions/authentication";
import { PROFILE_UPSERT_REQUEST } from "../store/actions/constants";
import {
  profileLoadFailure,
  profileLoadSuccess,
  profileUpsertFailure,
  ProfileUpsertRequest,
  profileUpsertSuccess
} from "../store/actions/profile";
import { profileSelector } from "../store/reducers/profile";
import { SagaCallReturnType } from "../types/utils";

// A saga to load the Profile.
export function* loadProfile(
  getProfile: TypeofApiCall<GetUserProfileT>
): Iterator<Effect | Option<Profile>> {
  try {
    const response: SagaCallReturnType<typeof getProfile> = yield call(
      getProfile,
      {}
    );

    if (response && response.status === 200) {
      // Ok we got a valid response, send a PROFILE_LOAD_SUCCESS action
      yield put(profileLoadSuccess(response.value));
      return some(response.value);
    }

    throw response ? response.value : Error(I18n.t("profile.errors.load"));
  } catch (error) {
    yield put(profileLoadFailure(error));
  }
  return none;
}

// A saga to update the Profile.
function* createOrUpdateProfileSaga(
  createOrUpdateProfile: TypeofApiCall<UpsertProfileT>,
  action: ProfileUpsertRequest
): Iterator<Effect> {
  // Get the current Profile from the state
  const profileState: ReturnType<typeof profileSelector> = yield select(
    profileSelector
  );

  if (!profileState) {
    // somewhing's wrong, we don't even have an AuthenticatedProfile meaning
    // the used didn't yet authenticated: ignore this upsert request.
    return;
  }

  // If we already have a profile, merge it with the new updated attributes
  // or else, create a new profile from the provided object
  // FIXME: perhaps this is responsibility of the caller?
  const newProfile: ExtendedProfile = profileState.extended
    ? {
        ...profileState.extended,
        ...action.payload
      }
    : {
        is_inbox_enabled: false,
        is_webhook_enabled: false,
        ...action.payload,
        version: 0
      };

  const response: SagaCallReturnType<typeof createOrUpdateProfile> = yield call(
    createOrUpdateProfile,
    {
      extendedProfile: newProfile
    }
  );

  if (response && response.status === 401) {
    // on 401, expire the current session and restart the authentication flow
    yield put(sessionExpired());
    return;
  }

  if (!response || response.status !== 200) {
    // We got a error, send a SESSION_UPSERT_FAILURE action
    const error: Error = response
      ? Error(response.value.title)
      : Error(I18n.t("profile.errors.upsert"));

    yield put(profileUpsertFailure(error));
  } else {
    // Ok we got a valid response, send a SESSION_UPSERT_SUCCESS action
    yield put(profileUpsertSuccess(response.value));
  }
}

// This function listens for Profile related requests and calls the needed saga.
export function* watchProfileUpsertRequestsSaga(
  createOrUpdateProfile: TypeofApiCall<UpsertProfileT>
): Iterator<Effect> {
  yield takeLatest(
    PROFILE_UPSERT_REQUEST,
    createOrUpdateProfileSaga,
    createOrUpdateProfile
  );
}
