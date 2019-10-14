/* tslint:disable */
import { Replies } from "instabug-reactnative";
import { call, Effect, put } from "redux-saga/effects";
import { responseInstabugInfoLoaded } from "../store/actions/instabug";
import { startTimer } from "../utils/timer";

// load instabug's number messages every five minutes
const INSTABUG_INFO_LOAD_INTERVAL = 60 * 5 * 1000;
var repliesCount = 0;
export function* watchInstabugSaga(
  retryPeriodically: boolean = false
): IterableIterator<Effect> {
  if (!retryPeriodically) {

  }
  // tslint:disable-next-line:no-commented-code
  // console.warn("get repliesCount");

  Replies.getUnreadRepliesCount(count => {
    repliesCount = count;
  });
  yield put(responseInstabugInfoLoaded(repliesCount));
  while (retryPeriodically) {
    // "start waiting"
    yield call(startTimer, INSTABUG_INFO_LOAD_INTERVAL);
    // "stop waiting"
    Replies.getUnreadRepliesCount(count => {
      repliesCount = count;
    });
    yield put(responseInstabugInfoLoaded(repliesCount));
  }
}
