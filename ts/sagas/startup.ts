import { Effect } from "redux-saga";
import { fork, put, select, take } from "redux-saga/effects";

import {
  sessionInvalid,
  SessionLoadFailure,
  sessionLoadRequest,
  SessionLoadSuccess,
  startAuthentication
} from "../store/actions/authentication";
import {
  APPLICATION_INITIALIZED,
  AUTHENTICATION_COMPLETED,
  PIN_LOGIN_INITIALIZE,
  SESSION_LOAD_FAILURE,
  SESSION_LOAD_SUCCESS,
  START_MAIN
} from "../store/actions/constants";
import { startNotificationInstallationUpdate } from "../store/actions/notifications";
import { startOnboarding } from "../store/actions/onboarding";
import { profileLoadRequest } from "../store/actions/profile";
import { isAuthenticatedSelector } from "../store/reducers/authentication";

/**
 * Saga to handle the application startup
 */
export function* watchApplicationInitialized(): IterableIterator<Effect> {
  while (true) {
    // Wait until the application is fully initialized (with store hydrated)
    yield take(APPLICATION_INITIALIZED);

    // Check if the user is logged in or not
    const isAuthenticated: boolean = yield select(isAuthenticatedSelector);

    // Only unauthenticated users need onboarding
    const needOnboarding = !isAuthenticated;

    // tslint:disable-next-line:no-let
    let sessionRefreshed = false;

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
        // Remove the session information from the store
        yield put(sessionInvalid());

        // Start the Authentication process
        yield put(startAuthentication());

        // Wait for the Authentication to be completed
        yield take(AUTHENTICATION_COMPLETED);

        sessionRefreshed = true;
      }
    }

    // If we are here the user is logged in and the session is loaded and valid

    // Get the profile info
    yield put(profileLoadRequest());

    // Start the notification installation update
    yield put(startNotificationInstallationUpdate());

    // Start the Onboarding
    if (needOnboarding) {
      yield put(startOnboarding());
    } else {
      // The Onboarding step is not needed

      // If the session was expired and has been refreshed go straight to the main screen
      if (sessionRefreshed) {
        yield put({
          type: START_MAIN
        });
      } else {
        // The session was valid so let the user enter the PIN before going to the main screen
        yield put({
          type: PIN_LOGIN_INITIALIZE
        });
      }
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(watchApplicationInitialized);
}
