import { Replies } from "instabug-reactnative";
import { Millisecond } from "italia-ts-commons/lib/units";
import { call, Effect, fork, put } from "redux-saga/effects";
import { responseInstabugInfoLoaded } from "../store/actions/instabug";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

const loadInstabugUnreadMessages = () => {
  return new Promise<number>(resolve => {
    Replies.getUnreadRepliesCount(count => {
      resolve(count);
    });
  });
};

// refresh instabug messages time rate
const INSTABUG_INFO_LOAD_INTERVAL: Millisecond = (60 * 5 * 1000) as Millisecond;

function* watchInstabugSaga(): IterableIterator<Effect> {
  while (true) {
    const repliesCount: SagaCallReturnType<
      typeof loadInstabugUnreadMessages
    > = yield call(loadInstabugUnreadMessages);
    yield put(responseInstabugInfoLoaded(repliesCount));
    yield call(startTimer, INSTABUG_INFO_LOAD_INTERVAL);
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(watchInstabugSaga);
}
