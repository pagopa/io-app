import { BugReporting, dismissType, Replies } from "instabug-reactnative";
import {
  call,
  Effect,
  fork,
  put,
  select,
  takeLatest
} from "redux-saga/effects";
import { instabugReportClosed } from "../store/actions/debug";
import {
  instabugUnreadMessagesLoaded,
  updateInstabugUnreadMessages
} from "../store/actions/instabug";
import { instabugLastOpenReportTypeSelector } from "../store/reducers/instabug/instabugUnreadMessages";

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

/**
 * listen about Instabug report dismiss event and dispatch an event with report type and how it was closed
 */
function* watchIBSDKdismiss() {
  const onDismissPromise = () =>
    new Promise<dismissType>(resolve => {
      // we don't use the parameter type since this handler has a bug: it reports always report type 'bug'
      // event when the user close 'question'
      BugReporting.onSDKDismissedHandler((how: dismissType): void =>
        resolve(how)
      );
    });
  while (true) {
    const ibHowDismissed = yield call(onDismissPromise);
    const type: ReturnType<typeof instabugLastOpenReportTypeSelector> =
      yield select(instabugLastOpenReportTypeSelector);
    if (type) {
      yield put(instabugReportClosed({ type, how: ibHowDismissed }));
    }
    yield put(updateInstabugUnreadMessages());
  }
}

function* watchInstabugSaga() {
  yield call(updateInstabugBadgeSaga);
  yield fork(watchIBSDKdismiss);

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
