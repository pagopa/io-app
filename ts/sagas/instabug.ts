import { Replies } from "instabug-reactnative";
import { call, Effect, put } from "redux-saga/effects";
import { responseInstabugInfoLoaded } from "../store/actions/instabug";
import { startTimer } from "../utils/timer";

// load instabug's number messages every five minutes
// 60 * 5 * 1000;
const INSTABUG_INFO_LOAD_INTERVAL = 3 * 1000;

export function* watchInstabugSaga(
  retryPeriodically: boolean = false
): IterableIterator<Effect> {
  if (!retryPeriodically) {
    // tslint:disable-next-line:no-commented-code
    // console.warn("custom dispatch");
  }
  // tslint:disable-next-line:no-commented-code
  // console.warn("get repliesCount");
  var repliesCount = 0;
  Replies.getUnreadRepliesCount(count => {
    repliesCount = count;
  });
  yield put(responseInstabugInfoLoaded(repliesCount));
  while (retryPeriodically) {
    // tslint:disable-next-line:no-commented-code
    // console.warn("start waiting");
    yield call(startTimer, INSTABUG_INFO_LOAD_INTERVAL);
    // tslint:disable-next-line:no-commented-code
    // console.warn("stop waiting");
    // console.warn("get repliesCount");
    var repliesCountPeriodically = 0;
    Replies.getUnreadRepliesCount(count => {
      repliesCountPeriodically = count;
    });
    yield put(responseInstabugInfoLoaded(repliesCountPeriodically));
  }
}
