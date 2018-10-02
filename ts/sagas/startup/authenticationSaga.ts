import { Effect } from "redux-saga";
import { put, select, take } from "redux-saga/effects";

import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../store/actions/analytics";
import { LoginSuccess } from "../../store/actions/authentication";
import { LOGIN_SUCCESS } from "../../store/actions/constants";
import { resetToAuthenticationRoute } from "../../store/actions/navigation";

import { NavigationActions } from "react-navigation";
import ROUTES from "../../navigation/routes";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { SessionToken } from "../../types/SessionToken";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): IterableIterator<Effect | SessionToken> {
  yield put(analyticsAuthenticationStarted());

  const isSessionExpired: boolean = yield select(isSessionExpiredSelector);

  // Reset the navigation stack and navigate to the authentication screen
  if (isSessionExpired) {
    // If the user is unauthenticated because of the expired session,
    // navigate directly to the IDP selection screen.
    yield put(
      NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION_IDP_SELECTION
      })
    );
  } else {
    // Otherwise, navigate to the landing screen.
    yield put(resetToAuthenticationRoute);
  }

  // Wait until the user has successfully logged in with SPID
  // FIXME: show an error on LOGIN_FAILED?
  const action: LoginSuccess = yield take(LOGIN_SUCCESS);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted());

  return action.payload;
}
