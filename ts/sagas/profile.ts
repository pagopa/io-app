/**
 * A saga that manages the Profile.
 */

import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import {
  ApiFetchResult,
  ApiProfile,
  fetchProfile,
  isApiFetchFailure,
  postProfile
} from "../api";
import { GlobalState } from "../reducers/types";
import {
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS
} from "../store/actions/constants";
import { ProfileUpdateRequest } from "../store/actions/profile";

// A selector to get the token from the state
const getSessionToken = (state: GlobalState): string | undefined =>
  state.session.isAuthenticated ? state.session.token : undefined;

// A saga to load the Profile.
function* loadProfile(): Iterator<Effect> {
  try {
    // Get the token from the state
    const token: string | undefined = yield select(getSessionToken);
    if (token === undefined) {
      throw new Error("session token is not defined");
    }

    // Fetch the profile from the proxy
    const response: ApiFetchResult<ApiProfile> = yield call(
      fetchProfile,
      token
    );

    if (isApiFetchFailure(response)) {
      // If the api response is an error then dispatch the PROFILE_LOAD_FAILURE action.
      yield put({
        type: PROFILE_LOAD_FAILURE,
        payload: response.error
      });
    } else {
      // If the api returns a valid Profile then dispatch the PROFILE_LOAD_SUCCESS action.
      yield put({ type: PROFILE_LOAD_SUCCESS, payload: response.result });
    }
  } catch (error) {
    // If the api request raise an exception then dispatch the PROFILE_LOAD_FAILURE action.
    yield put({ type: PROFILE_LOAD_FAILURE, payload: error });
  }
}

// A saga to update the Profile.
function* updateProfile(action: ProfileUpdateRequest): Iterator<Effect> {
  try {
    // Get the new Profile from the action payload
    const newProfile = action.payload;

    // Get the token from the state
    const token: string | undefined = yield select(getSessionToken);
    if (token === undefined) {
      throw new Error("session token is not defined");
    }

    // Post the new Profile to the proxy
    const response: ApiFetchResult<ApiProfile> = yield call(
      postProfile,
      token,
      newProfile
    );
    if (isApiFetchFailure(response)) {
      // If the api response is an error then dispatch the PROFILE_UPDATE_FAILURE action.
      yield put({
        type: PROFILE_UPDATE_FAILURE,
        payload: response.error
      });
    } else {
      // If the api returns a valid Profile then dispatch the PROFILE_UPDATE_SUCCESS action.
      yield put({ type: PROFILE_UPDATE_SUCCESS, payload: response.result });
    }
  } catch (error) {
    // If the api request raise an exception then dispatch the PROFILE_UPDATE_FAILURE action.
    yield put({
      type: PROFILE_UPDATE_FAILURE,
      payload: error
    });
  }
}

// This function listens for Profile related requests and calls the needed saga.
export default function* root(): Iterator<Effect> {
  yield takeLatest(PROFILE_LOAD_REQUEST, loadProfile);
  yield takeLatest(PROFILE_UPDATE_REQUEST, updateProfile);
}
