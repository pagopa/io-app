/**
 * A collection of sagas to manage the Authentication.
 */
import { NavigationActions, NavigationState } from "react-navigation";
import { Effect } from "redux-saga";
import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { PublicSession } from "../../definitions/backend/PublicSession";
import {
  BackendClient,
  BasicResponseTypeWith401,
  SuccessResponse
} from "../api/backend";
import { apiUrlPrefix } from "../config";
import I18n from "../i18n";
import ROUTES from "../navigation/routes";
import { applicationInitialized } from "../store/actions/application";
import {
  authenticationCompleted,
  IdpSelected,
  LoginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionLoadFailure,
  sessionLoadRequest,
  sessionLoadSuccess,
  startAuthentication
} from "../store/actions/authentication";
import {
  AUTHENTICATION_COMPLETED,
  IDP_SELECTED,
  LOGIN_SUCCESS,
  LOGOUT_REQUEST,
  SESSION_EXPIRED,
  SESSION_LOAD_REQUEST,
  SESSION_LOAD_SUCCESS,
  START_AUTHENTICATION
} from "../store/actions/constants";
import { navigationRestore } from "../store/actions/navigation";
import { sessionTokenSelector } from "../store/reducers/authentication";
import { navigationStateSelector } from "../store/reducers/navigation";
import { SessionToken } from "../types/SessionToken";

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
    }
  } else {
    // No SessionToken we can't send a SESSION_LOAD_FAILURE action
    yield put(sessionLoadFailure(Error()));
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

export function* watchLogoutRequest(): IterableIterator<Effect> {
  while (true) {
    yield take(LOGOUT_REQUEST);

    // Get the SessionToken from the store
    const sessionToken: SessionToken | undefined = yield select(
      sessionTokenSelector
    );

    if (sessionToken) {
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);

      // Call the Backend service
      const response:
        | BasicResponseTypeWith401<SuccessResponse>
        | undefined = yield call(backendClient.logout, {});

      if (!response || response.status !== 200) {
        // We got a error, send a LOGOUT_FAILURE action
        const error: Error = response
          ? response.value
          : Error(I18n.t("authentication.errors.logout"));

        yield put(logoutFailure(error));
      } else {
        // Ok we got a valid response send the LOGOUT_SUCCESS action
        yield put(logoutSuccess());

        // Dispatch the APPLICATION_INITIALIZED action so we can start all from the beginning
        yield put(applicationInitialized());
      }
    } else {
      yield put(logoutFailure(Error(I18n.t("authentication.errors.notoken"))));
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
  yield fork(watchStartAuthentication);
  yield takeLatest(SESSION_LOAD_REQUEST, loadSession);
  yield fork(watchSessionExpired);
  yield fork(watchLogoutRequest);
}
