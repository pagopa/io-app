/**
 * A saga to manage notifications
 */
import { call, Effect, put, select } from "redux-saga/effects";

import {
  removeScheduledNotificationAccessSpid,
  scheduleLocalNotificationsAccessSpid
} from "../boot/scheduleLocalNotifications";
import { sessionInvalid } from "../store/actions/authentication";
import { isFirstRunAfterInstallSelector } from "../store/reducers/installation";
import { deletePin } from "../utils/keychain";

/**
 * This generator function removes user data from previous application
 * installation
 */
export function* previousInstallationDataDeleteSaga(): Generator<
  Effect,
  void,
  boolean
> {
  const isFirstRunAfterInstall: ReturnType<typeof isFirstRunAfterInstallSelector> = yield select(
    isFirstRunAfterInstallSelector
  );

  if (isFirstRunAfterInstall) {
    // Delete the current unlock code from the Keychain
    // eslint-disable-next-line
    yield call(deletePin);
    // invalidate the session
    yield put(sessionInvalid());
    // Remove all the notification already set
    yield call(removeScheduledNotificationAccessSpid);
    // Schedule a set of local notifications
    yield call(scheduleLocalNotificationsAccessSpid);
  }
}
