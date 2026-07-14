import { testSaga } from "redux-saga-test-plan";

// TODO [SIW-4084] import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";
import { watchItwStatusListSaga } from "..";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";

describe("watchItwStatusListSaga", () => {
  it("stops when L3 is not enabled", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(itwIsL3EnabledSelector)
      .next(false)
      .isDone();
  });

  it("forks status list sagas when L3 is enabled", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(itwIsL3EnabledSelector)
      .next(true)
      // TODO [SIW-4084] .fork(registerStatusListFetchTaskSaga)
      // TODO [SIW-4084] .next()
      .fork(checkStatusListCoherenceSaga)
      .next()
      .isDone();
  });
});
