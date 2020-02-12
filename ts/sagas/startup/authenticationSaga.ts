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
import { checkCieAvailabilitySaga, checkNfcEnablementSaga } from "../cie";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): IterableIterator<Effect | SessionToken> {
  yield put(analyticsAuthenticationStarted());

  // Watch for checks on login by CIE on the used device and NFC sensor enablement
  const checkNfcEnablement = yield fork(checkNfcEnablementSaga);
  yield call(checkCieAvailabilitySaga);

  // Reset the navigation stack and navigate to the authentication screen
  yield put(resetToAuthenticationRoute);

  // Wait until the user has successfully logged in with SPID
  // FIXME: show an error on LOGIN_FAILED?
  const action: ActionType<typeof loginSuccess> = yield take(
    getType(loginSuccess)
  );

  // Once the login is completed, stop watching for the NFC sensor enablement
  yield cancel(checkNfcEnablement);

  // User logged in successfully, remove all the scheduled local notifications
  // to remind the user to authenticate with spid
  yield call(removeScheduledNotificationAccessSpid);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted());

  return action.payload;
}
