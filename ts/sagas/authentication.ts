import {
  NavigationActions,
  NavigationState,
  StackActions
} from "react-navigation";
import { Effect } from "redux-saga";
import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { PublicSession } from "../../definitions/backend/PublicSession";
import { BackendClient, BasicResponseTypeWith401 } from "../api/backend";
import { apiUrlPrefix } from "../config";
import ROUTES from "../navigation/routes";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../store/actions/analytics";
import {
  sessionInformationLoadFailure,
  sessionInformationLoadRequest,
  sessionInformationLoadSuccess
} from "../store/actions/authentication";
import {
  LOGIN_SUCCESS,
  SESSION_EXPIRED,
  SESSION_LOAD_REQUEST,
  SESSION_LOAD_SUCCESS
} from "../store/actions/constants";
import { navigationRestore } from "../store/actions/navigation";
import { sessionTokenSelector } from "../store/reducers/authentication";
import { navigationStateSelector } from "../store/reducers/navigation";
import { SessionToken } from "../types/SessionToken";

/**
 * Load session info from the Backend
 */
export function* loadSessionInformation(): IterableIterator<Effect> {
  // Get the SessionToken from the store
  const sessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );

  if (sessionToken) {
    const backendClient = BackendClient(apiUrlPrefix, sessionToken);

    // Call the Backend service
    const response:
      | BasicResponseTypeWith401<PublicSession>
      | undefined = yield call(backendClient.getSession, {});

    if (!response || response.status !== 200) {
      // We got a error, send a SESSION_LOAD_FAILURE action
      const error: Error = response ? response.value : Error();

      yield put(sessionInformationLoadFailure(error));
    } else {
      // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
      yield put(sessionInformationLoadSuccess(response.value));
    }
  } else {
    // No SessionToken
    // FIXME: consider having a specific error? who listens for this?
    yield put(sessionInformationLoadFailure(Error("No session token")));
  }
}

/**
 * Handles the expiration of session while the user is using the app.
 *
 * On session expiration (SESSION_EXPIRED action):
 * 1) Saves the navigation state
 * 2) Asks the user to re-authenticate with SPID
 * 3) Restores the navigation state to bring the user back to the screen he was
 *
 * NOTE: This saga handles SESSION_EXPIRED actions one by one, this means that
 * if more than one SESSION_EXPIRED action get dispatched at the same time, only
 * one get served.
 * FIXME: the above statement is not clear, are *all* SESSION_EXPIRED actions
 * going to be processed one by one, or just the first one, or the latest?
 */
export function* watchSessionExpired(): IterableIterator<Effect> {
  while (true) {
    // Wait for a SESSION_EXPIRED action
    yield take(SESSION_EXPIRED);

    // Get the navigation state from the store so we can restore it back
    const navigationState: NavigationState = yield select(
      navigationStateSelector
    );

    // Restart the authentication flow
    yield call(authenticationSaga);

    // Request the session info from the backend
    yield put(sessionInformationLoadRequest);

    // Wait until session info is loaded
    //
    // FIXME: this could never happen in case the loading of the session info
    //        fails with SESSION_LOAD_FAILURE!!!!
    // TODO:  we can probably skip this and still open the app even when loading
    //        session info fails, let the app logic deal with valid/invalid
    //        session info data
    yield take(SESSION_LOAD_SUCCESS);

    // Restore the navigation state to bring the user back to the screen it was before the logout
    yield put(navigationRestore(navigationState));
  }
}

/**
 * A saga that manages the user authentication.
 */
export function* authenticationSaga(): Iterator<Effect> {
  yield put(analyticsAuthenticationStarted);

  // Reset the navigation stack and navigate to the authentication screen
  yield put(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: ROUTES.AUTHENTICATION
        })
      ]
    })
  );

  // Wait until the user has successfully logged in with SPID
  yield take(LOGIN_SUCCESS);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted);
}

export default function* root(): IterableIterator<Effect> {
  // Starts the loadSession saga in the background on each SESSION_LOAD_REQUEST
  // action, if a running loadSession exists, it gets cancelled.
  yield takeLatest(SESSION_LOAD_REQUEST, loadSessionInformation);

  // Handles the expiration of the session token
  yield fork(watchSessionExpired);
}
