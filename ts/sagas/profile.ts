/**
 * A saga that manages the Profile.
 */

import { takeLatest, call, put, select, Effect } from 'redux-saga/effects'

import {
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_SUCCESS
} from '../store/actions/constants'
import { ProfileUpdateRequest } from '../store/actions/profile'
import { ApiFetchResult, ApiProfile, fetchProfile, postProfile } from '../api'
import { GlobalState } from '../reducers/types'

// A selector to get the token from the state
const getSessionToken = (state: GlobalState): string | null =>
  state.session.isAuthenticated ? state.session.token : null

// A saga to load the Profile.
function* loadProfile(): Iterator<Effect> {
  try {
    // Get the token from the state
    const token: string = yield select(getSessionToken)

    // Fetch the profile from the proxy
    const response: ApiFetchResult<ApiProfile> = yield call(fetchProfile, token)

    if (response.isError) {
      // If the api response is an error then dispatch the PROFILE_LOAD_FAILURE action.
      yield put({
        type: PROFILE_LOAD_FAILURE,
        payload: response.error
      })
    } else if (!response.isError) {
      // If the api returns a valid Profile then dispatch the PROFILE_LOAD_SUCCESS action.
      yield put({ type: PROFILE_LOAD_SUCCESS, payload: response.result })
    }
  } catch (error) {
    // If the api request raise an exception then dispatch the PROFILE_LOAD_FAILURE action.
    yield put({ type: PROFILE_LOAD_FAILURE, payload: error })
  }
}

// A saga to update the Profile.
function* updateProfile(action: ProfileUpdateRequest): Iterator<Effect> {
  try {
    // Get the new Profile from the action payload
    const newProfile = action.payload

    // Get the token from the state
    const token: string = yield select(getSessionToken)

    // Post the new Profile to the proxy
    const response: ApiFetchResult<ApiProfile> = yield call(
      postProfile,
      token,
      newProfile
    )
    if (response.isError) {
      // If the api response is an error then dispatch the PROFILE_UPDATE_FAILURE action.
      yield put({
        type: PROFILE_UPDATE_FAILURE,
        payload: response.error
      })
    } else {
      // If the api returns a valid Profile then dispatch the PROFILE_UPDATE_SUCCESS action.
      yield put({ type: PROFILE_UPDATE_SUCCESS, payload: response.result })
    }
  } catch (error) {
    // If the api request raise an exception then dispatch the PROFILE_UPDATE_FAILURE action.
    yield put({
      type: PROFILE_UPDATE_FAILURE,
      payload: error
    })
  }
}

// This function listens for Profile related requests and calls the needed saga.
export default function* root(): Iterator<Effect> {
  yield takeLatest(PROFILE_LOAD_REQUEST, loadProfile)
  yield takeLatest(PROFILE_UPDATE_REQUEST, updateProfile)
}
