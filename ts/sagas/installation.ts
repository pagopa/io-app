/**
 * A saga to manage notifications
 */
import { call, put, select } from "typed-redux-saga/macro";
import {
  removeScheduledNotificationAccessSpid,
  scheduleLocalNotificationsAccessSpid
} from "../boot/scheduleLocalNotifications";
import { sessionInvalid } from "../store/actions/authentication";
import { isFirstRunAfterInstallSelector } from "../store/reducers/installation";
import { ReduxSagaEffect } from "../types/utils";

/**
 * This generator function removes user data from previous application
 * installation
 */
export function* previousInstallationDataDeleteSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  const isFirstRunAfterInstall: ReturnType<
    typeof isFirstRunAfterInstallSelector
  > = yield* select(isFirstRunAfterInstallSelector);

  if (isFirstRunAfterInstall) {
    // invalidate the session
    yield* put(sessionInvalid());
    // Remove all the notification already set
    yield* call(removeScheduledNotificationAccessSpid);
    // Schedule a set of local notifications
    yield* call(scheduleLocalNotificationsAccessSpid);
  }
}
