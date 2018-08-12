/**
 * A saga that manages the Profile.
 */
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import {
  BackendClient,
  BasicResponseTypeWith401,
  GetProfileT,
  ProfileWithOrWithoutEmail
} from "../api/backend";

import { apiUrlPrefix } from "../config";

import I18n from "../i18n";

import { PROFILE_UPSERT_REQUEST } from "../store/actions/constants";
import {
  profileLoadFailure,
  profileLoadSuccess,
  profileUpsertFailure,
  ProfileUpsertRequest,
  profileUpsertSuccess
} from "../store/actions/profile";
import { sessionTokenSelector } from "../store/reducers/authentication";
import { profileSelector, ProfileState } from "../store/reducers/profile";
import { SessionToken } from "../types/SessionToken";

import { callApiWith401ResponseStatusHandler } from "./api";

import { TypeofApiCall } from "italia-ts-commons/lib/requests";

// A saga to load the Profile.
export function* loadProfile(
  getProfile: TypeofApiCall<GetProfileT>
): Iterator<Effect | boolean> {
  const response:
    | BasicResponseTypeWith401<ProfileWithOrWithoutEmail>
    | undefined = yield call(getProfile, {});

  if (!response || response.status !== 200) {
    // We got a error, send a SESSION_LOAD_FAILURE action
    const error: Error = response
      ? response.value
      : Error(I18n.t("profile.errors.load"));

    yield put(profileLoadFailure(error));
    return false;
  } else {
    // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
    yield put(profileLoadSuccess(response.value));
    return true;
  }
}

// A saga to update the Profile.
function* createOrUpdateProfile(
  action: ProfileUpsertRequest
): Iterator<Effect> {
  // Get the token from the state
  const sessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );

  if (sessionToken) {
    // Get the current Profile from the state
    const profileState: ProfileState = yield select(profileSelector);

    // If we already have a profile, merge it with the new updated attributes
    // or else, create a new profile from the provided object
    const newProfile = profileState
      ? {
          ...profileState,
          ...action.payload
        }
      : action.payload;

    const backendClient = BackendClient(apiUrlPrefix, sessionToken);

    const response:
      | BasicResponseTypeWith401<ProfileWithOrWithoutEmail>
      | undefined = yield call(
      callApiWith401ResponseStatusHandler,
      backendClient.createOrUpdateProfile,
      { newProfile }
    );

    if (!response || response.status !== 200) {
      // We got a error, send a SESSION_UPSERT_FAILURE action
      const error: Error = response
        ? response.value
        : Error(I18n.t("profile.errors.upsert"));

      yield put(profileUpsertFailure(error));
    } else {
      // Ok we got a valid response, send a SESSION_UPSERT_SUCCESS action
      yield put(profileUpsertSuccess(response.value));
    }
  } else {
    // No SessionToken can't send the request
    yield put(
      profileUpsertFailure(Error(I18n.t("authentication.errors.notoken")))
    );
  }
}

// This function listens for Profile related requests and calls the needed saga.
export default function* root(): Iterator<Effect> {
  yield takeLatest(PROFILE_UPSERT_REQUEST, createOrUpdateProfile);
}
