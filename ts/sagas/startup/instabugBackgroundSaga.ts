import { Replies } from "instabug-reactnative";
import { Effect, Task } from "redux-saga";
import { call, cancel, fork, put, select, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import I18n from "../../i18n";
import {
  applicationChangeState,
  ApplicationState
} from "../../store/actions/application";
import {
  instabugUnreadMessagesNotificationLoaded,
  updateInstabugUnreadNotification
} from "../../store/actions/instabug";
import { SagaCallReturnType } from "../../types/utils";
import { startTimer } from "../../utils/timer";

import PushNotification from "react-native-push-notification";
import { appStateSelector } from "../../store/reducers/appState";
import { GlobalState } from "../../store/reducers/types";

const loadInstabugUnreadMessages = () => {
  return new Promise<number>(resolve => {
    Replies.getUnreadRepliesCount(count => {
      resolve(count);
    });
  });
};
// refresh instabug unread messages time rate
const backgroundActivityTimeoutMillis = 5 * 1000;
/**
 * Listen to APP_STATE_CHANGE_ACTION and control instabug unread messages
 */
export function* instabugBackgroundSaga(): IterableIterator<Effect> {
  /**
   * These are the unread messages when the saga starts
   */
  const initialUnreadMessages: SagaCallReturnType<
    typeof loadInstabugUnreadMessages
  > = yield call(loadInstabugUnreadMessages);

  yield put(instabugUnreadMessagesNotificationLoaded(initialUnreadMessages));

  const notification = () => {
    PushNotification.localNotificationSchedule({
      title: I18n.t("notifications.instabug.localNotificationTitle"),
      message: I18n.t("notifications.instabug.localNotificationMessage"),
      date: new Date(Date.now()),
      tag: "local_notification_instabug",
      userInfo: { tag: "local_notification_instabug" }
    });
  };

  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";

  // tslint:disable-next-line:no-let
  let actualState: ApplicationState | undefined;

  // tslint:disable-next-line:no-let
  let identificationBackgroundTimer: Task | undefined;

  yield takeEvery(getType(applicationChangeState), function*(
    action: ActionType<typeof applicationChangeState>
  ) {
    // Listen for changes in application state
    const newApplicationState: ApplicationState = action.payload;

    actualState = newApplicationState;

    if (lastState !== "background" && newApplicationState === "background") {
      // Start the background timer
      identificationBackgroundTimer = yield fork(function*() {
        while (actualState === "background") {
          actualState = yield select<GlobalState>(appStateSelector);

          /**
           * Unread messages at this time
           */
          const unreadMessagesNow: SagaCallReturnType<
            typeof loadInstabugUnreadMessages
          > = yield call(loadInstabugUnreadMessages);
          // tslint:disable-next-line:no-console
          console.log(
            `notifiche da visualizzare: ${unreadMessagesNow -
              initialUnreadMessages}`
          );

          /**
           * if there are new messages
           */
          if (unreadMessagesNow > initialUnreadMessages) {
            yield call(notification);
            yield put(
              updateInstabugUnreadNotification({
                unreadMessagesNotification: unreadMessagesNow
              })
            );
          }
          yield call(startTimer, backgroundActivityTimeoutMillis);
          identificationBackgroundTimer = undefined;
        }
      });
    } else if (
      lastState !== "active" &&
      newApplicationState === "active" &&
      identificationBackgroundTimer
    ) {
      // Cancel the background timer if running
      yield cancel(identificationBackgroundTimer);
      identificationBackgroundTimer = undefined;
    }

    // Update the last state
    lastState = newApplicationState;
  });
}
