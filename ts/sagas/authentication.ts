/**
 * A collection of sagas to manage the Authentication.
 */
import { Option } from "fp-ts/lib/Option";
import {
  NavigationActions,
  NavigationState,
  StackActions
} from "react-navigation";
import { Effect } from "redux-saga";
import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { PublicSession } from "../../definitions/backend/PublicSession";
import {
  BackendClient,
  BasicResponseTypeWith401,
  SuccessResponse
} from "../api/backend";
import { apiUrlPrefix, backgroundActivityTimeout } from "../config";
import I18n from "../i18n";
import ROUTES from "../navigation/routes";
import {
  authenticationCompleted,
  logoutFailure,
  logoutSuccess,
  sessionLoadFailure,
  sessionLoadRequest,
  sessionLoadSuccess,
  startAuthentication,
  walletTokenLoadSuccess,
  sessionExpired
} from "../store/actions/authentication";
import {
  APP_STATE_CHANGE_ACTION,
  AUTHENTICATION_COMPLETED,
  LOGIN_SUCCESS,
  LOGOUT_REQUEST,
  PIN_LOGIN_INITIALIZE,
  PIN_LOGIN_VALIDATE_SUCCESS,
  SESSION_EXPIRED,
  SESSION_LOAD_REQUEST,
  SESSION_LOAD_SUCCESS,
  START_AUTHENTICATION
} from "../store/actions/constants";
import { navigationRestore } from "../store/actions/navigation";
import {
  ApplicationState,
  ApplicationStateAction
} from "../store/actions/types";
import {
  isAuthenticatedSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import {
  INITIAL_STATE,
  navigationStateSelector
} from "../store/reducers/navigation";
import { PinString } from "../types/PinString";
import { SessionToken } from "../types/SessionToken";
import { getPin } from "../utils/keychain";

/**
 * Load session info from the Backend
 */
export function* loadSession(): IterableIterator<Effect> {
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

      yield put(sessionLoadFailure(error));
    } else {
      // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
      yield put(sessionLoadSuccess(response.value));
      // FIXME: why we need a walletTokenLoadSuccess action? can't the wallet
      // listen on sessionLoadSuccess?
      yield put(walletTokenLoadSuccess()); // inform wallet saga that the token has been made available
    }
  } else {
    // No SessionToken
    // FIXME: consider having a specific error? who listens for this?
    yield put(sessionLoadFailure(Error("No session token")));
  }
}

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to provide
 * the PIN
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchApplicationActivity(): IterableIterator<Effect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";
  // tslint:disable-next-line:no-let
  let lastUpdateAtMillis: number | undefined;

  // We will use this to save and then restore the navigation
  // FIXME: Navigation's saga INITIAL_STATE should not leak here!
  // tslint:disable-next-line:no-let
  let navigationState: NavigationState = INITIAL_STATE;

  while (true) {
    // listen for changes in application state
    const action: ApplicationStateAction = yield take(APP_STATE_CHANGE_ACTION);
    const newApplicationState: ApplicationState = action.payload;

    // get the time elapsed from the last change in state
    const nowMillis = new Date().getTime();
    const timeElapsedMillis = lastUpdateAtMillis
      ? nowMillis - lastUpdateAtMillis
      : nowMillis;

    if (lastState !== "background" && newApplicationState === "background") {
      // The app is going into background

      // Save the navigation state so we can restore in case the PIN login is needed
      // tslint:disable-next-line:saga-yield-return-type
      navigationState = yield select(navigationStateSelector);

      // Make sure that when the app come back active, the BackgrounScreen
      // gets loaded first
      yield put(
        NavigationActions.navigate({
          routeName: ROUTES.BACKGROUND
        })
      );
    } else if (lastState === "background" && newApplicationState === "active") {
      // The app is coming back active after being in background

      if (timeElapsedMillis > backgroundActivityTimeoutMillis) {
        // If the app has been in background state for more that the timeout
        // we may need to ask the user to provide the PIN

        // Whether the user was authenticated
        const isAuthenticated: boolean = yield select(isAuthenticatedSelector);

        // Whether the user had a PIN configured
        const maybePin: Option<PinString> = yield call(getPin);
        const hasPin = maybePin.isSome();

        if (isAuthenticated && hasPin) {
          // We ask the user to provide a PIN only of the user was previously
          // authenticated and he had a PIN configured.

          // Start the PIN authentication
          yield put({ type: PIN_LOGIN_INITIALIZE });

          // Wait until the user has successfully authenticated with the PIN
          yield take(PIN_LOGIN_VALIDATE_SUCCESS);
        }
      }

      // Now either the user want's fully authenticated or, if it was, we asked
      // him to provide the PIN and he did successfully.
      // We can the navigation to the previous state.
      if (navigationState) {
        // FIXME: why the if? navigationState is always initialized
        yield put(navigationRestore(navigationState));
      }
    }

    // Update the last state and update time
    lastState = newApplicationState;
    lastUpdateAtMillis = nowMillis;
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
    yield put(startAuthentication());

    // Wait for the authentication to be completed successfully
    yield take(AUTHENTICATION_COMPLETED);

    // Request the session info from the backend
    yield put(sessionLoadRequest());

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
 * Handles the logout flow
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchLogoutRequest(): IterableIterator<Effect> {
  while (true) {
    // wait for a request to log out
    yield take(LOGOUT_REQUEST);

    // Get the SessionToken from the store
    const sessionToken: SessionToken | undefined = yield select(
      sessionTokenSelector
    );

    // Whether the user need to be logged out
    if (sessionToken) {
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);

      // Issue a logout request to the backend, asking to delete the session
      // FIXME: if there's no connectivity to the backend, this request will
      //        block for a while.
      const response:
        | BasicResponseTypeWith401<SuccessResponse>
        | undefined = yield call(backendClient.logout, {});

      if (!response || response.status !== 200) {
        // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
        const error: Error = response
          ? response.value
          : Error(I18n.t("authentication.errors.logout"));
        yield put(logoutFailure(error));
      }
    } else {
      yield put(logoutFailure(Error(I18n.t("authentication.errors.notoken"))));
    }

    // Force the login by expiring the session
    yield put(sessionExpired());
  }
}

/**
 * A saga that manages the user authentication.
 */
export function* watchStartAuthentication(): IterableIterator<Effect> {
  while (true) {
    // wait for a request to start the authentication flow
    yield take(START_AUTHENTICATION);

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
    yield put(authenticationCompleted());
  }
}

export default function* root(): IterableIterator<Effect> {
  // Starts the loadSession saga in the background on each SESSION_LOAD_REQUEST
  // action, if a running loadSession exists, it gets cancelled.
  yield takeLatest(SESSION_LOAD_REQUEST, loadSession);

  // Handles the expiration of the session token
  yield fork(watchSessionExpired);

  // Handles the app going to background state and back in active state
  yield fork(watchApplicationActivity);

  // Handles the authentication flow
  yield fork(watchStartAuthentication);

  // Handles logout
  // FIXME: it could make sense to merge this with watchSessionExpired
  yield fork(watchLogoutRequest);
}
