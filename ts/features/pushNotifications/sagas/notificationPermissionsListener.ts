import { call, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { applicationChangeState } from "../../../store/actions/application";
import { checkAndUpdateNotificationPermissionsIfNeeded } from "./common";

export function* notificationPermissionsListener() {
  // Update the in-memory status (since it is not stored)
  yield* call(checkAndUpdateNotificationPermissionsIfNeeded, true);
  // Listen for application state changes in order to
  // retrieve the system notification permission status
  // when the application goes back into foreground
  yield* takeLatest(
    applicationChangeState,
    checkNotificationPermissionsOnAppForegroundState
  );
}

export function* checkNotificationPermissionsOnAppForegroundState(
  applicationChangeStateAction: ActionType<typeof applicationChangeState>
) {
  // If the application is now active in foreground
  const currentAppState = applicationChangeStateAction.payload;
  if (currentAppState === "active") {
    // Check if the system notification permission has changed
    // and update it into the in-memory status (if needed)
    yield* call(checkAndUpdateNotificationPermissionsIfNeeded);
  }
}
