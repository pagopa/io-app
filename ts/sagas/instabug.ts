import { Replies } from "instabug-reactnative";
import { call, Effect, fork, put, take } from "redux-saga/effects";
import { instabugInfoLoad } from "../store/actions/instabug";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

// load instabug's number messages every five minutes
const INSTABUG_INFO_LOAD_INTERVAL = 60 * 5 * 1000;

// retry instabug's number messages every 10 seconds on error
const INSTABUG_INFO_RETRY_INTERVAL = 60 * 60 * 10 * 1000;

function* instabugInfoWatcher(): IterableIterator<Effect> {
  function getInstabugInfo(): Promise<any> {
    const repliesCount = Replies.getUnreadRepliesCount(count => count);
    return Promise.resolve(repliesCount);
  }
  while (true) {
    yield take(instabugInfoLoad.request);
    const instaBugInfoResponse: SagaCallReturnType<
      typeof getInstabugInfo
    > = yield call(getInstabugInfo, {});
    if (
      instaBugInfoResponse.isRight() &&
      instaBugInfoResponse.value.status === 200
    ) {
      yield put(instabugInfoLoad.success(instaBugInfoResponse.value.value));
      // set?
      alert(instaBugInfoResponse.value.value);
      yield call(startTimer, INSTABUG_INFO_LOAD_INTERVAL);
    } else {
      yield put(
        instabugInfoLoad.failure(new Error("Cannot read instabug info"))
      );
      yield call(startTimer, INSTABUG_INFO_RETRY_INTERVAL);
    }
  }
}

export default function* watchInstabugSaga(): IterableIterator<Effect> {
  yield fork(instabugInfoWatcher);
}
