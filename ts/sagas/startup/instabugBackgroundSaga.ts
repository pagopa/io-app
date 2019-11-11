import { Effect, Task } from "redux-saga";
import { call, cancel, fork, put, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { Replies } from "instabug-reactnative";
import { instabugUnreadMessagesLoaded } from "../../store/actions/instabug";
import { SagaCallReturnType } from "../../types/utils";

import {
  applicationChangeState,
  ApplicationState
} from "../../store/actions/application";
import { startTimer } from "../../utils/timer";

import PushNotification from "react-native-push-notification";

const loadInstabugUnreadMessages = () => {
  return new Promise<number>(resolve => {
    Replies.getUnreadRepliesCount(count => {
      resolve(count);
    });
  });
};

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to identify
 */
export function* instabugBackgroundSaga(): IterableIterator<Effect> {
  const messaggiAttuali: SagaCallReturnType<
    typeof loadInstabugUnreadMessages
  > = yield call(loadInstabugUnreadMessages);
  yield put(instabugUnreadMessagesLoaded(messaggiAttuali));
  console.log("Messaggi attuali");
  console.log(messaggiAttuali);
  const backgroundActivityTimeoutMillis = 2 * 1000;

  const notification = () => {
    PushNotification.localNotificationSchedule({
      title: "IO",
      message: "Hai un nuovo messaggio da instabug",
      date: new Date(Date.now()),
      tag: "local_notification_instabug",
      userInfo: { tag: "local_notification_instabug" }
    });
  };

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

        // tslint:disable-next-line:no-commented-code
        // const instabugUnreadState: ReturnType<
        //   typeof instabugMessageStateSelector
        // > = yield select<GlobalState>(instabugMessageStateSelector);

        const instabugRepliesCount: SagaCallReturnType<
          typeof loadInstabugUnreadMessages
        > = yield call(loadInstabugUnreadMessages);

        yield put(instabugUnreadMessagesLoaded(instabugRepliesCount));
        console.log("Messaggi arrivati");
        console.log(instabugRepliesCount);

        if (instabugRepliesCount > messaggiAttuali) {
          console.log("Ho un nuovo messaggio");
          yield call(notification);
        }
        // Timer fired we need to identify the user
        // yield put(identificationRequest());
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
