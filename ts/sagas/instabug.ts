import { Replies } from "instabug-reactnative";
import { Millisecond } from "italia-ts-commons/lib/units";
import { call, Effect, fork, put, takeLatest } from "redux-saga/effects";
import {
  instabugUnreadMessagesLoaded,
  updateInstabugUnreadMessages
} from "../store/actions/instabug";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

const loadInstabugUnreadMessages = () => {
  return new Promise<number>(resolve => {
    Replies.getUnreadRepliesCount(count => {
      resolve(count);
    });
  });
};

// refresh instabug unread messages time rate, for now it is 5 min
const INSTABUG_INFO_LOAD_INTERVAL: Millisecond = (5 * 60 * 1000) as Millisecond;

function* watchInstabugSaga(): IterableIterator<Effect> {
  while (true) {
    yield call(updateInstabugBadgeSaga);
    yield call(startTimer, INSTABUG_INFO_LOAD_INTERVAL);
  }
}

function* updateInstabugBadgeSaga(): IterableIterator<Effect> {
  const repliesCount: SagaCallReturnType<
    typeof loadInstabugUnreadMessages
  > = yield call(loadInstabugUnreadMessages);
  yield put(instabugUnreadMessagesLoaded(repliesCount));
}

export default function* root(): IterableIterator<Effect> {
  // Update number of instabug unread messages
  yield takeLatest(updateInstabugUnreadMessages, updateInstabugBadgeSaga);
  yield fork(watchInstabugSaga);
}
