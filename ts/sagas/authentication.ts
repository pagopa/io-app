/**
 * A collection of sagas to manage the Authentication.
 */
import { isSome, Option } from "fp-ts/lib/Option";
import { NavigationActions, NavigationState } from "react-navigation";
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
  IdpSelected,
  LoginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionLoadFailure,
  sessionLoadRequest,
  sessionLoadSuccess,
  startAuthentication,
  walletTokenLoadSuccess
} from "../store/actions/authentication";
import {
  APP_STATE_CHANGE_ACTION,
  AUTHENTICATION_COMPLETED,
  IDP_SELECTED,
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
import { callApiWith401ResponseStatusHandler } from "./api";

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
      yield put(walletTokenLoadSuccess()); // inform wallet saga that the token has been made available
    }
  } else {
    // No SessionToken we can't send a SESSION_LOAD_FAILURE action
    yield put(sessionLoadFailure(Error()));
  }
}

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to insert the PIN
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchApplicationActivity(): IterableIterator<Effect> {
  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";
  // tslint:disable-next-line:no-let
  let lastUpdateAt = -1;

  // We will use this to save and then restore the navigation
  // tslint:disable-next-line:no-let
  let navigationState: NavigationState = INITIAL_STATE;

  while (true) {
    const action: ApplicationStateAction = yield take(APP_STATE_CHANGE_ACTION);

    const newState: ApplicationState = action.payload;
    const newUpdateAt = new Date().getTime();

    const timeElapsed = newUpdateAt - lastUpdateAt;
    if (lastState === "active" && newState === "background") {
      // Save the navigation state so we can restore in case the PIN login is needed
      // tslint:disable-next-line:saga-yield-return-type
      navigationState = yield select(navigationStateSelector);

      // Push the BackgroundScreen
      yield put(
        NavigationActions.navigate({
          routeName: ROUTES.BACKGROUND
        })
      );
    } else if (
      lastState === "background" && // The app was in background
      newState === "active" // The app is now active
    ) {
      if (timeElapsed > backgroundActivityTimeout * 1000) {
        // Check if the user is logged in or not
        const isAuthenticated: boolean = yield select(isAuthenticatedSelector);

        // Check if the user set a PIN
        const basePin: Option<PinString> = yield call(getPin);

        // We need to act only if the user is authenticated and has a PIN set
        if (isAuthenticated && isSome(basePin)) {
          // Start the PIN LOGIN
          yield put({
            type: PIN_LOGIN_INITIALIZE
          });

          yield take(PIN_LOGIN_VALIDATE_SUCCESS);
        }
      }

      // Restore the navigation state
      if (navigationState) {
        yield put(navigationRestore(navigationState));
      }
    }

    lastState = newState;
    lastUpdateAt = newUpdateAt;
  }
}

/**
 * Listen for SESSION_EXPIRED.
 * This saga:
 * 1) Save the navigation state
 * 2) Allow the user to re-authenticate
 * 3) Restore the navigation state to bring the user back to the screen he was
 *
 * NOTE: This saga manage SESSION_EXPIRED one by one, this means that if more than one SESSION_EXPIRED
 * get dispatched at the same time only one get served.
 */
export function* watchSessionExpired(): IterableIterator<Effect> {
  while (true) {
    // Wait for LOGOUT action
    yield take(SESSION_EXPIRED);

    // Get the navigation state from the store so we can restore it back
    const navigationState: NavigationState = yield select(
      navigationStateSelector
    );

    // Restart the authentication
    yield put(startAuthentication());

    // Wait for the Authentication to be completed
    yield take(AUTHENTICATION_COMPLETED);

    // Request the session info
    yield put(sessionLoadRequest());

    // Wait until session info is loaded
    yield take(SESSION_LOAD_SUCCESS);

    // Restore the navigation state to bring the user back to the screen it was before the logout
    yield put(navigationRestore(navigationState));
  }
}

// tslint:disable-next-line:cognitive-complexity
export function* watchLogoutRequest(): IterableIterator<Effect> {
  while (true) {
    yield take(LOGOUT_REQUEST);

    // Get the SessionToken from the store
    const sessionToken: SessionToken | undefined = yield select(
      sessionTokenSelector
    );

    // A variable to decide if the user need to be logged out
    // tslint:disable-next-line:no-let
    let needLogout = true;
    if (sessionToken) {
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);

      // Call the Backend service
      const response:
        | BasicResponseTypeWith401<SuccessResponse>
        | undefined = yield call(
        callApiWith401ResponseStatusHandler,
        backendClient.logout,
        {}
      );

      if (!response || response.status !== 200) {
        // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
        const error: Error = response
          ? response.value
          : Error(I18n.t("authentication.errors.logout"));

        // The user is already logged out by watchSessionExpired saga on SESSION_EXPIRED
        if (response && response.status === 401) {
          needLogout = false;
        }

        yield put(logoutFailure(error));
      }
    } else {
      yield put(logoutFailure(Error(I18n.t("authentication.errors.notoken"))));
    }

    /**
     * The user is logged out in in all the case except when the logout request
     * returns 401 (SESSION_EXPIRED).
     */
    if (needLogout) {
      yield put(logoutSuccess());
    }
  }
}

/**
 * A saga that wait for START_AUTHENTICATION action than manages the user authentication.
 */
export function* watchStartAuthentication(): IterableIterator<Effect> {
  while (true) {
    yield take(START_AUTHENTICATION);

    // Show the Authentication LandingScreen to the user
    yield put(
      NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION,
        action: NavigationActions.navigate({
          routeName: ROUTES.AUTHENTICATION_LANDING
        })
      })
    );

    // Wait the user to select the IDP
    yield take(IDP_SELECTED);

    // Show the user the IdpLoginScreen
    yield put(
      NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION_IDP_LOGIN
      })
    );

    while (true) {
      /**
       * The user can finish the login or go back and change the IDP so we need to wait both actions.
       */
      const action: IdpSelected | LoginSuccess = yield take([
        IDP_SELECTED,
        LOGIN_SUCCESS
      ]);

      // If the user changes the IDP
      if (action.type === IDP_SELECTED) {
        // Show the user the IdpLoginScreen again
        yield put(
          NavigationActions.navigate({
            routeName: ROUTES.AUTHENTICATION_IDP_LOGIN
          })
        );

        continue;
      }

      // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
      yield put(authenticationCompleted());
      break;
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  yield takeLatest(SESSION_LOAD_REQUEST, loadSession);
  yield fork(watchStartAuthentication);
  yield fork(watchApplicationActivity);
  yield fork(watchSessionExpired);
  yield fork(watchLogoutRequest);
}
