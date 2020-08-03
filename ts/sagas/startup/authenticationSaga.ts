import { Effect } from "redux-saga";
import { call, cancel, fork, put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { removeScheduledNotificationAccessSpid } from "../../boot/scheduleLocalNotifications";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../store/actions/analytics";
import { loginSuccess } from "../../store/actions/authentication";
import { resetToAuthenticationRoute } from "../../store/actions/navigation";
import { SessionToken } from "../../types/SessionToken";
import { stopCieManager, watchCieAuthenticationSaga } from "../cie";
import { watchTestLoginRequestSaga } from "../testLoginSaga";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): IterableIterator<Effect | SessionToken> {
  yield put(analyticsAuthenticationStarted());

  yield fork(watchTestLoginRequestSaga);
  // Watch for login by CIE
  const watchCieAuthentication = yield fork(watchCieAuthenticationSaga);

  // Reset the navigation stack and navigate to the authentication screen
  yield put(resetToAuthenticationRoute);

  // Wait until the user has successfully logged in with SPID
  // FIXME: show an error on LOGIN_FAILED?
  const action: ActionType<typeof loginSuccess> = yield take(
    getType(loginSuccess)
  );

  yield cancel(watchCieAuthentication);
  // stop cie manager from listening nfc
  yield call(stopCieManager);

  // User logged in successfully, remove all the scheduled local notifications
  // to remind the user to authenticate with spid
  yield call(removeScheduledNotificationAccessSpid);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted());

  return action.payload;
}
