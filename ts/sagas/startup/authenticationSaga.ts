import { call, cancel, Effect, fork, put, take } from "redux-saga/effects";
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
import { OPERISSUES_10_track } from "../startup";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): Generator<Effect, SessionToken, any> {
  yield call(OPERISSUES_10_track, "authenticationSaga_1");
  yield put(analyticsAuthenticationStarted());
  yield call(OPERISSUES_10_track, "authenticationSaga_2");
  // Watch for the test login
  const watchTestLogin = yield fork(watchTestLoginRequestSaga);
  yield call(OPERISSUES_10_track, "authenticationSaga_3");
  // Watch for login by CIE
  const watchCieAuthentication = yield fork(watchCieAuthenticationSaga);
  yield call(OPERISSUES_10_track, "authenticationSaga_4");
  // Reset the navigation stack and navigate to the authentication screen
  yield call(resetToAuthenticationRoute);
  yield call(OPERISSUES_10_track, "authenticationSaga_5");
  // Wait until the user has successfully logged in with SPID
  // FIXME: show an error on LOGIN_FAILED?
  const action: ActionType<typeof loginSuccess> = yield take(
    getType(loginSuccess)
  );
  yield call(OPERISSUES_10_track, "authenticationSaga_6");

  yield cancel(watchCieAuthentication);
  yield cancel(watchTestLogin);
  yield call(OPERISSUES_10_track, "authenticationSaga_7");
  // stop cie manager from listening nfc
  yield call(stopCieManager);
  yield call(OPERISSUES_10_track, "authenticationSaga_8");
  // User logged in successfully, remove all the scheduled local notifications
  // to remind the user to authenticate with spid
  yield call(removeScheduledNotificationAccessSpid);
  yield call(OPERISSUES_10_track, "authenticationSaga_9");
  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted());
  yield call(OPERISSUES_10_track, "authenticationSaga_10");
  return action.payload.token;
}
