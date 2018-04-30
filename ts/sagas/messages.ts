/**
 * A saga that manages the Messages.
 */

import { takeLatest, call, put, select, Effect } from 'redux-saga/effects'

import {
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  MESSAGES_LOAD_FAILURE, PROFILE_LOAD_FAILURE, PROFILE_LOAD_SUCCESS, PROFILE_UPDATE_REQUEST, PROFILE_LOAD_REQUEST
} from '../store/actions/constants'

import {
  ApiFetchResult,
  ApiMessages, ApiProfile,
  fetchMessages, fetchProfile,
  isApiFetchFailure
} from '../api'
import { GlobalState } from '../reducers/types'

// A selector to get the token from the state
const getSessionToken = (state: GlobalState): string | null =>
  state.session.isAuthenticated ? state.session.token : null

function* loadMessages(): Iterator<Effect> {try {

  console.log("LOAD MESSAGES");
  // Get the token from the state
  const token: string = yield select(getSessionToken)

  // Fetch the profile from the proxy
  const response: ApiFetchResult<ApiProfile> = yield call(fetchMessages, token)

  if (isApiFetchFailure(response)) {
    // If the api response is an error then dispatch the PROFILE_LOAD_FAILURE action.
    yield put({
      type: MESSAGES_LOAD_FAILURE,
      payload: response.error
    })
  } else {
    // If the api returns a valid Profile then dispatch the PROFILE_LOAD_SUCCESS action.
    yield put({ type: MESSAGES_LOAD_SUCCESS, payload: response.result })
  }
} catch (error) {
  // If the api request raise an exception then dispatch the PROFILE_LOAD_FAILURE action.
  yield put({ type: MESSAGES_LOAD_FAILURE , payload: error })
}

}

// This function listens for Messages request
export default function* root(): Iterator<Effect> {
  console.log("SAGA MESSAGES WATCHER");
  yield takeLatest(MESSAGES_LOAD_REQUEST, loadMessages)
}
