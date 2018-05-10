/**
 * A saga that manages the Profile.
 */

import { ApiResponse } from "apisauce";
import { call, Effect, put, takeLatest } from "redux-saga/effects";

import { proxyApi } from "../api/api";
import { ApiProfile } from "../api/ProxyApi";
import {
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS
} from "../store/actions/constants";
import { ProfileUpdateRequest } from "../store/actions/profile";

// A saga to load the Profile.
function* loadProfile(): Iterator<Effect> {
  try {
    // Fetch the profile from the proxy
    const response: ApiResponse<ApiProfile> = yield call(proxyApi.readProfile);

    if (response.ok) {
      // If the api returns a valid Profile then dispatch the PROFILE_LOAD_SUCCESS action.
      yield put({ type: PROFILE_LOAD_SUCCESS, payload: response.data });
    } else {
      // If the api response is an error then dispatch the PROFILE_LOAD_FAILURE action.
      yield put({
        type: PROFILE_LOAD_FAILURE,
        payload: response.problem
      });
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

    // Post the new Profile to the proxy
    const response: ApiResponse<ApiProfile> = yield call(
      proxyApi.updateProfile,
      newProfile
    );
    if (response.ok) {
      // If the api returns a valid Profile then dispatch the PROFILE_UPDATE_SUCCESS action.
      yield put({ type: PROFILE_UPDATE_SUCCESS, payload: response.data });
    } else {
      // If the api response is an error then dispatch the PROFILE_UPDATE_FAILURE action.
      yield put({
        type: PROFILE_UPDATE_FAILURE,
        payload: response.problem
      });
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
