/**
 * A saga that manages the Session.
 */

import { NavigationActions } from "react-navigation";
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import ROUTES from "../navigation/routes";
import {
  APPLICATION_INITIALIZED,
  IDP_SELECTED,
  LOGIN_SUCCESS,
  SESSION_INITIALIZE_SUCCESS
} from "../store/actions/constants";
import { loadProfile } from "../store/actions/profile";
import { isAuthenticatedSelector } from "../store/reducers/session";

function* loginStep(): Iterator<Effect> {
  // The user loggedin successfully

  // Fetch the Profile
  yield put(loadProfile());

  // Session is established we can dispatch SESSION_INITIALIZE_SUCCESS
  yield put({
    type: SESSION_INITIALIZE_SUCCESS
  });
}

function* idpSelectionStep(): Iterator<Effect> {
  // When the IDP is selected we must show the user the IdpLoginScreen
  const navigateAction = NavigationActions.navigate({
    routeName: ROUTES.AUTHENTICATION_IDP_LOGIN
  });
  yield put(navigateAction);

  // We wait for a successful login
  yield takeLatest(LOGIN_SUCCESS, loginStep);
}

function* landingStep(): Iterator<Effect> {
  // We must show the LandingScreen to the user
  const navigateAction = NavigationActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({ routeName: ROUTES.AUTHENTICATION_LANDING })
    ],
    key: ROUTES.AUTHENTICATION
  });
  yield put(navigateAction);

  // We wait the user IDP selection
  yield takeLatest(IDP_SELECTED, idpSelectionStep);
}

function* sessionSaga(): Iterator<Effect> {
  // From the state we check if the session is already established
  const isAuthenticated: boolean = yield select(isAuthenticatedSelector);
  if (!isAuthenticated) {
    // If the session is not established we continue to the landing step
    yield call(landingStep);
  } else {
    /**
     * If the session is established we can dispatch SESSION_INITIALIZE_SUCCESS.
     *
     * TODO: Start the real session management (inizialization/refresh)
     * @https://www.pivotaltracker.com/story/show/156692215
     */
    yield put({
      type: SESSION_INITIALIZE_SUCCESS
    });
  }
}

export default function* root(): Iterator<Effect> {
  /**
   * The Session saga is the first started on application startup.
   * The APPLICATION_INITIALIZED action is dispatched by the IngressScreen.
   */
  yield takeLatest(APPLICATION_INITIALIZED, sessionSaga);
}
