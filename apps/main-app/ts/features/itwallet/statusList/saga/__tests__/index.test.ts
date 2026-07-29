import { testSaga } from "redux-saga-test-plan";

import { watchItwStatusListSaga } from "..";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors";
import { registerStatusListProperties } from "../../analytics";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";
// TODO [SIW-4084] import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";

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
      .call(registerStatusListProperties)
      .next()
      .isDone();
  });
});
