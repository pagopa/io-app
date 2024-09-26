import { call, take } from "typed-redux-saga/macro";
import { applicationChangeState } from "../../../store/actions/application";
import { checkAndUpdateNotificationPermissionsIfNeeded } from "./common";

export function* notificationPermissionsListener() {
  // Update the in-memory status (since it is not stored)
  yield* call(checkAndUpdateNotificationPermissionsIfNeeded);
  while (true) {
    // Every time that there is an application state change,
    // if the application is now active in foreground
    const stateChangedAction = yield* take(applicationChangeState);
    if (stateChangedAction.payload === "active") {
      // Check if the system notification permission has changed
      // and update it into the in-memory status (if needed)
      yield* call(checkAndUpdateNotificationPermissionsIfNeeded);
    }
  }
}
