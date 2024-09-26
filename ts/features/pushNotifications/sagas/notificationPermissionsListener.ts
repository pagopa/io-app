import { call, take } from "typed-redux-saga/macro";
import { applicationChangeState } from "../../../store/actions/application";
import { checkAndUpdateNotificationPermissionsIfNeeded } from "./common";

export function* notificationPermissionsListener() {
  yield* call(checkAndUpdateNotificationPermissionsIfNeeded);
  while (true) {
    const stateChangedAction = yield* take(applicationChangeState);
    if (stateChangedAction.payload === "active") {
      yield* call(checkAndUpdateNotificationPermissionsIfNeeded);
    }
  }
}
