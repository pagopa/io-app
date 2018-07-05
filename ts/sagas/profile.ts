/**
 * A saga that manages the Profile.
 */
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import {
  BackendClient,
  BasicResponseTypeWith401,
  ProfileWithOrWithoutEmail
} from "../api/backend";
import { apiUrlPrefix } from "../config";
import {
  PROFILE_LOAD_REQUEST,
  PROFILE_UPSERT_REQUEST
} from "../store/actions/constants";
import {
  profileLoadFailure,
  profileLoadSuccess,
  profileUpsertFailure,
  ProfileUpsertRequest,
  profileUpsertSuccess
} from "../store/actions/profile";
import { sessionTokenSelector } from "../store/reducers/authentication";
import { SessionToken } from "../types/SessionToken";
import { callApiWith401ResponseStatusHandler } from "./api";

// A saga to load the Profile.
function* loadProfile(): Iterator<Effect> {
  const sessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );

  if (sessionToken) {
    const backendClient = BackendClient(apiUrlPrefix, sessionToken);

    const response:
      | BasicResponseTypeWith401<ProfileWithOrWithoutEmail>
      | undefined = yield call(
      callApiWith401ResponseStatusHandler,
      backendClient.getProfile,
      {}
    );

    if (!response || response.status !== 200) {
      // We got a error, send a SESSION_LOAD_FAILURE action
      const error: Error = response ? response.value : Error();

      yield put(profileLoadFailure(error));
    } else {
      // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
      yield put(profileLoadSuccess(response.value));
    }
  } else {
    // No SessionToken can't send the request
    yield put(profileLoadFailure(Error()));
  }
}

// A saga to update the Profile.
function* createOrUpdateProfile(
  action: ProfileUpsertRequest
): Iterator<Effect> {
  // Get the new Profile from the action payload
  const newProfile = action.payload;

  // Get the token from the state
  const sessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );

  if (sessionToken) {
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
      const error: Error = response ? response.value : Error();

      yield put(profileUpsertFailure(error));
    } else {
      // Ok we got a valid response, send a SESSION_UPSERT_SUCCESS action
      yield put(profileUpsertSuccess(response.value));
    }
  } else {
    // No SessionToken can't send the request
    yield put(profileUpsertFailure(Error()));
  }
}

// This function listens for Profile related requests and calls the needed saga.
export default function* root(): Iterator<Effect> {
  yield takeLatest(PROFILE_LOAD_REQUEST, loadProfile);
  yield takeLatest(PROFILE_UPSERT_REQUEST, createOrUpdateProfile);
}
