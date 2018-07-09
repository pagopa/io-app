import { Effect } from "redux-saga";
import { fork, put, select, take } from "redux-saga/effects";

import {
  logout,
  SessionLoadFailure,
  sessionLoadRequest,
  SessionLoadSuccess,
  startAuthentication
} from "../store/actions/authentication";
import {
  APPLICATION_INITIALIZED,
  AUTHENTICATION_COMPLETED,
  SESSION_LOAD_FAILURE,
  SESSION_LOAD_SUCCESS
} from "../store/actions/constants";
import { startNotificationInstallationUpdate } from "../store/actions/notifications";
import { startOnboarding } from "../store/actions/onboarding";
import { profileLoadRequest } from "../store/actions/profile";
import { isAuthenticatedSelector } from "../store/reducers/authentication";

/**
 * Saga to handle the application startup
 */
export function* watchApplicationInitialized(): IterableIterator<Effect> {
  // Wait until the application is fully initialized (with store hydrated)
  yield take(APPLICATION_INITIALIZED);

  // Check if the user is logged in or not
  const isAuthenticated: boolean = yield select(isAuthenticatedSelector);

  if (!isAuthenticated) {
    // The user is logged out
    yield put(startAuthentication());

    // Wait for the Authentication to be completed
    yield take(AUTHENTICATION_COMPLETED);

    // Get the session info
    yield put(sessionLoadRequest());

    yield take([SESSION_LOAD_SUCCESS]);
  } else {
    // The user is logged in

    // Get the session info
    yield put(sessionLoadRequest());

    // Wait until the request is completed
    const action: SessionLoadSuccess | SessionLoadFailure = yield take([
      SESSION_LOAD_SUCCESS,
      SESSION_LOAD_FAILURE
    ]);

    // If we received SESSION_LOAD_FAILURE this means the session is not-valid
    if (action.type === SESSION_LOAD_FAILURE) {
      // Logout the user (remove the session information from the store)
      yield put(logout());

      // Start the Authentication process
      yield put(startAuthentication());

      // Wait for the Authentication to be completed
      yield take(AUTHENTICATION_COMPLETED);
    }
  }

  // If we are here the user is logged in and the session is loaded and valid

  // Get the profile info
  yield put(profileLoadRequest());

  // Start the notification installation update
  yield put(startNotificationInstallationUpdate());

  // Start the Onboarding
  yield put(startOnboarding());
}

export default function* root(): IterableIterator<Effect> {
  yield fork(watchApplicationInitialized);
}
