import { Effect } from "redux-saga";
import { call, put, select, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { removeScheduledNotificationAccessSpid } from "../../boot/scheduleLocalNotifications";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../store/actions/analytics";
import { loginSuccess } from "../../store/actions/authentication";
import {
  navigateToIdpSelectionScreenAction,
  resetToAuthenticationRoute
} from "../../store/actions/navigation";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import { SessionToken } from "../../types/SessionToken";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): IterableIterator<Effect | SessionToken> {
  yield put(analyticsAuthenticationStarted());

  const isSessionExpired: boolean = yield select<GlobalState>(
    isSessionExpiredSelector
  );

  // Reset the navigation stack and navigate to the authentication screen
  yield put(resetToAuthenticationRoute);
  if (isSessionExpired) {
    // If the user is unauthenticated because of the expired session,
    // navigate to the IDP selection screen.
    yield put(navigateToIdpSelectionScreenAction);
  }

  // Wait until the user has successfully logged in with SPID
  // FIXME: show an error on LOGIN_FAILED?
  const action: ActionType<typeof loginSuccess> = yield take(
    getType(loginSuccess)
  );

  // User logged in successfully, remove all the scheduled local notifications
  // to remind the user to authenticate with spid
  yield call(removeScheduledNotificationAccessSpid);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted());

  return action.payload;
}
