import { BugReporting, dismissType, Replies } from "instabug-reactnative";
import { EventChannel, eventChannel } from "redux-saga";
import { call, Effect, fork, put, takeLatest } from "redux-saga/effects";
import {
  InstabugDismiss,
  InstabugReport,
  instabugReportClosed
} from "../store/actions/debug";
import {
  instabugUnreadMessagesLoaded,
  updateInstabugUnreadMessages
} from "../store/actions/instabug";

const loadInstabugUnreadMessages = () =>
  new Promise<number>(resolve => {
    Replies.getUnreadRepliesCount(count => {
      resolve(count);
    });
  });

// promise will be resolver when the OnNewReplyReceivedCallback will be executed
const onNewReplyReceived = () =>
  new Promise<void>(resolve => {
    Replies.setOnNewReplyReceivedCallback(() => {
      resolve();
    });
  });

function initializeInstabugSDKDismissalListener(): EventChannel<unknown> {
  // Register to the instabug dismiss event.
  // (https://docs.instabug.com/docs/react-native-bug-reporting-event-handlers#section-after-dismissing-instabug)
  // This event is fired when chat or bug screen is dismissed

  return eventChannel(emitter => {
    BugReporting.onSDKDismissedHandler(
      (dismiss: dismissType, reportType: BugReporting.reportType): void =>
        emitter({ dismiss, reportType })
    );

    return () => null;
  });
}

function* instabugSDKDismissalWorker({
  how,
  type
}: InstabugDismiss & InstabugReport) {
  yield put(instabugReportClosed({ type, how }));
  // when user dismisses instabug report (chat or bug) we update the unread messages counter.
  // This is because user could have read or reply to some messages
  yield put(updateInstabugUnreadMessages());
}

function* watchInstabugSaga() {
  const instabugSDKDismissalChannel = yield call(
    initializeInstabugSDKDismissalListener
  );

  yield takeLatest(instabugSDKDismissalChannel, instabugSDKDismissalWorker);

  yield call(updateInstabugBadgeSaga);

  while (true) {
    yield call(onNewReplyReceived);
    yield call(updateInstabugBadgeSaga);
  }
}

function* updateInstabugBadgeSaga(): Generator<any, void, number> {
  const repliesCount = yield call(loadInstabugUnreadMessages);
  yield put(instabugUnreadMessagesLoaded(repliesCount));
}

export default function* root(): IterableIterator<Effect> {
  // Update number of instabug unread messages
  yield takeLatest(updateInstabugUnreadMessages, updateInstabugBadgeSaga);
  yield fork(watchInstabugSaga);
}
