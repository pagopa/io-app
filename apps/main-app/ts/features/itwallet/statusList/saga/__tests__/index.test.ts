import { testSaga } from "redux-saga-test-plan";

import { watchItwStatusListSaga } from "..";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";
import { refreshStaleStatusListsSaga } from "../refreshStaleStatusListsSaga";
import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";

describe("watchItwStatusListSaga", () => {
  it("stops when L3 is not enabled", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(itwIsL3EnabledSelector)
      .next(false)
      .isDone();
  });

  it("runs status list sagas when L3 is enabled", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(itwIsL3EnabledSelector)
      .next(true)
      .fork(registerStatusListFetchTaskSaga)
      .next()
      .call(checkStatusListCoherenceSaga)
      .next()
      .call(refreshStaleStatusListsSaga)
      .next()
      .isDone();
  });
});
