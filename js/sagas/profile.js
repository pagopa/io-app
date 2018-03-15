/**
 * A saga that manages the Profile.
 *
 * @flow
 */

import { type Saga } from 'redux-saga'
import { takeLatest, call, put, select } from 'redux-saga/effects'

import {
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_SUCCESS
} from '../store/actions/constants'
import { type ProfileUpdateRequest } from '../store/actions/profile'
import {
  type ApiFetchResult,
  type ApiProfile,
  fetchProfile,
  postProfile
} from '../api'
import { type GlobalState } from '../reducers/types'

// A selector to get the token from the state
// TODO: Move this in external file before merging into master
const getToken = (state: GlobalState) =>
  state.user.isLoggedIn ? state.user.token : null

// A saga to load the Profile.
function* loadProfile(): Saga<void> {
  try {
    // Get the token from the state
    const token: string = yield select(getToken)

    // Fetch the profile from the proxy
    const response: ApiFetchResult<ApiProfile> = yield call(fetchProfile, token)

    if (response.isError) {
      // If the api response is an error then dispatch the PROFILE_LOAD_FAILURE action.
      yield put({
        type: PROFILE_LOAD_FAILURE,
        payload: response.error
      })
    } else {
      // If the api returns a valid Profile then dispatch the PROFILE_LOAD_SUCCESS action.
      yield put({ type: PROFILE_LOAD_SUCCESS, payload: response.result })
    }
  } catch (error) {
    // If the api request raise an exception then dispatch the PROFILE_LOAD_FAILURE action.
    yield put({ type: PROFILE_LOAD_FAILURE, payload: error })
  }
}

// A saga to update the Profile.
function* updateProfile(action: ProfileUpdateRequest): Saga<void> {
  try {
    // Get the new Profile from the action payload
    const newProfile = action.payload

    // Get the token from the state
    const token: string = yield select(getToken)

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

// This function listen for Profile related request and call the nedded saga.
export default function* root(): Saga<void> {
  yield takeLatest(PROFILE_LOAD_REQUEST, loadProfile)
  yield takeLatest(PROFILE_UPDATE_REQUEST, updateProfile)
}
