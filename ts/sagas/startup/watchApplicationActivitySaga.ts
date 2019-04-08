import { Effect, Task } from "redux-saga";
import { call, cancel, fork, put, select, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { backgroundActivityTimeout } from "../../config";
import {
  applicationChangeState,
  ApplicationState
} from "../../store/actions/application";
import { identificationRequest } from "../../store/actions/identification";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { clearNotificationPendingMessage } from "../../store/actions/notifications";
import { pendingMessageStateSelector } from "../../store/reducers/notifications/pendingMessage";
import { GlobalState } from "../../store/reducers/types";
import { isPaymentOngoingSelector } from "../../store/reducers/wallet/payment";
import { startTimer } from "../../utils/timer";

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to identify
 */
export function* watchApplicationActivitySaga(): IterableIterator<Effect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";

  // tslint:disable-next-line:no-let
  let identificationBackgroundTimer: Task | undefined;

  yield takeEvery(getType(applicationChangeState), function*(
    action: ActionType<typeof applicationChangeState>
  ) {
    // Listen for changes in application state
    const newApplicationState: ApplicationState = action.payload;

    if (lastState !== "background" && newApplicationState === "background") {
      // Start the background timer
      identificationBackgroundTimer = yield fork(function*() {
        // Start and wait the timer to fire
        yield call(startTimer, backgroundActivityTimeoutMillis);
        identificationBackgroundTimer = undefined;
        // Timer fired we need to identify the user
        yield put(identificationRequest());
      });
    } else if (
      lastState !== "active" &&
      newApplicationState === "active" &&
      identificationBackgroundTimer
    ) {
      // Cancel the background timer if running

      yield cancel(identificationBackgroundTimer);
      identificationBackgroundTimer = undefined;

      // Check if there is a payment ongoing
      const isPaymentOngoing: ReturnType<
        typeof isPaymentOngoingSelector
      > = yield select<GlobalState>(isPaymentOngoingSelector);

      // Check if we have a pending notification message
      const pendingMessageState: ReturnType<
        typeof pendingMessageStateSelector
      > = yield select<GlobalState>(pendingMessageStateSelector);

      // We only navigate to the new message from a push if we're not in a
      // payment flow
      if (!isPaymentOngoing && pendingMessageState) {
        // We have a pending notification message to handle
        const messageId = pendingMessageState.id;

        // Remove the pending message from the notification state
        yield put(clearNotificationPendingMessage());

        // Navigate to message details screen
        yield put(navigateToMessageDetailScreenAction({ messageId }));
      }
    }

    // Update the last state
    lastState = newApplicationState;
  });
}
