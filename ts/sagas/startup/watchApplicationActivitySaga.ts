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
import { resolveAfterMillis } from "../../utils/timer";

/**
 * Listen to changes in app state
 */
export function* watchApplicationActivitySaga(): IterableIterator<Effect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // this code gets executed first when the app is active
  // tslint:disable-next-line:no-let
  let currentAppState: ApplicationState = "active";

  // tslint:disable-next-line:no-let
  let identificationTimerTaskId: Task | undefined;

  // Listen for changes in application state
  // applicationChangeState actions get triggered by the AppState listeners
  // initialized in the RootContainer
  yield takeEvery(getType(applicationChangeState), function*(
    action: ActionType<typeof applicationChangeState>
  ) {
    // the state the app is transitioning to
    const nextAppState: ApplicationState = action.payload;

    if (nextAppState === currentAppState) {
      // Ignore bogus app state events
      return;
    }

    if (
      nextAppState === "background" &&
      identificationTimerTaskId === undefined
    ) {
      // The app is running in the background. The user is either:
      // - in another app
      // - on the home screen
      // - [Android] on another Activity (even if it was launched by your app)
      //
      // When transitioning to the background state we start a timer that will
      // trigger the identificationScreen after backgroundActivityTimeoutMillis
      identificationTimerTaskId = yield fork(function*() {
        // Start and wait the timer to fire
        yield call(resolveAfterMillis, backgroundActivityTimeoutMillis);
        // when the timer completes, we unset the timer handle and activate
        // the identification screen
        identificationTimerTaskId = undefined;
        yield put(identificationRequest());
      });
    } else if (
      nextAppState !== "background" &&
      identificationTimerTaskId !== undefined
    ) {
      // The app is running in the foreground and the timer hasn't completed
      // yet (or else identificationBackgroundTimer will be undefined)

      // FIXME: the following cancels the forked saga, it DOES NOT cancel the
      //        background timer (possible memory leak)
      yield cancel(identificationTimerTaskId);
      identificationTimerTaskId = undefined;

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
      if (!isPaymentOngoing && pendingMessageState !== null) {
        // We have a pending notification message to handle
        const messageId = pendingMessageState.id;

        // Remove the pending message from the notification state
        yield put(clearNotificationPendingMessage());

        // Navigate to message details screen
        yield put(navigateToMessageDetailScreenAction({ messageId }));
      }
    }

    // Update the last state
    currentAppState = nextAppState;
  });
}
