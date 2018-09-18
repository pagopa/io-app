import { NavigationActions } from "react-navigation";
import { Effect } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { backgroundActivityTimeout } from "../../config";
import { startApplicationInitialization } from "../../store/actions/application";
import { APP_STATE_CHANGE_ACTION } from "../../store/actions/constants";
import {
  navigateToBackgroundScreen,
  navigateToMessageDetailScreenAction
} from "../../store/actions/navigation";
import { clearNotificationPendingMessage } from "../../store/actions/notifications";
import {
  ApplicationState,
  ApplicationStateAction
} from "../../store/actions/types";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../../store/reducers/notifications/pendingMessage";
import { saveNavigationStateSaga } from "../startup/saveNavigationStateSaga";

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to provide
 * the PIN
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchApplicationActivitySaga(): IterableIterator<Effect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";

  // tslint:disable-next-line:no-let
  let lastUpdateAtMillis: number | undefined;

  yield takeEvery(APP_STATE_CHANGE_ACTION, function*(
    action: ApplicationStateAction
  ) {
    // listen for changes in application state
    const newApplicationState: ApplicationState = action.payload;

    // get the time elapsed from the last change in state
    const nowMillis = new Date().getTime();
    const timeElapsedMillis = lastUpdateAtMillis
      ? nowMillis - lastUpdateAtMillis
      : nowMillis;

    if (lastState !== "background" && newApplicationState === "background") {
      // The app is going into background
      // Save the navigation state so we can restore it later when the app come
      // back to the active state
      yield call(saveNavigationStateSaga);

      // Make sure that when the app come back active, the BackgrounScreen
      // gets loaded first
      // FIXME: not that this creates a quick blue flash in case after restoring
      //        the app we don't ask a PIN
      yield put(navigateToBackgroundScreen);
    } else if (lastState === "background" && newApplicationState === "active") {
      // The app is coming back active after being in background
      if (timeElapsedMillis > backgroundActivityTimeoutMillis) {
        // If the app has been in background state for more than the timeout,
        // re-initialize the app from scratch
        yield put(startApplicationInitialization);
      } else {
        // Check if we have a pending notification message
        const pendingMessageState: PendingMessageState = yield select(
          pendingMessageStateSelector
        );
        if (pendingMessageState) {
          // We have a pending notification message to handle
          const messageId = pendingMessageState.id;
          // Remove the pending message from the notification state
          yield put(clearNotificationPendingMessage());
          // Navigate to message details screen
          yield put(navigateToMessageDetailScreenAction(messageId));
        } else {
          // Or else, just navigate back to the screen we were at before
          // going into background
          yield put(NavigationActions.back());
        }
      }
    }

    // Update the last state and update time
    lastState = newApplicationState;
    lastUpdateAtMillis = nowMillis;
  });
}
