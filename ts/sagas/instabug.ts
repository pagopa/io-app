import { Replies } from "instabug-reactnative";
import { call, Effect, fork, put, takeLatest } from "redux-saga/effects";
import {
  instabugUnreadMessagesLoaded,
  updateInstabugUnreadMessages
} from "../store/actions/instabug";

const loadInstabugUnreadMessages = () => new Promise<number>(resolve => {
    Replies.getUnreadRepliesCount(count => {
      resolve(count);
    });
  });

// promise will be resolver when the OnNewReplyReceivedCallback will be executed
const onNewReplyReceived = () => new Promise<void>(resolve => {
    Replies.setOnNewReplyReceivedCallback(() => {
      resolve();
    });
  });

function* watchInstabugSaga(): IterableIterator<Effect> {
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
