import { testSaga } from "redux-saga-test-plan";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";
import { watchItwStatusListSaga } from "..";

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
      .fork(checkStatusListCoherenceSaga)
      .next()
      .isDone();
  });
});
