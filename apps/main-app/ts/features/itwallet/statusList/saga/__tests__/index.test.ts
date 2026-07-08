import { testSaga } from "redux-saga-test-plan";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";
import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";
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
      .fork(registerStatusListFetchTaskSaga)
      .next()
      .fork(checkStatusListCoherenceSaga)
      .next()
      .isDone();
  });
});

describe("startupStatusListCoherenceSaga", () => {
  it("prunes unreferenced entries, then refreshes the stale ones", () => {
    const itwVersion = "1.3.3";
    const referencedUris = ["https://issuer.example/status/1"];

    testSaga(startupStatusListCoherenceSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next(itwVersion)
      .select(itwStatusListReferencedUrisSelector)
      .next(referencedUris)
      .call(startupCoherence, referencedUris)
      .next()
      .call(refreshStaleEntries, { itwVersion })
      .next()
      .isDone();
  });
});
