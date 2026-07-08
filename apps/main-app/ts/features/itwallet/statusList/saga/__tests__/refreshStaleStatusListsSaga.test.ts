/* eslint-disable jest/expect-expect */
import { testSaga } from "redux-saga-test-plan";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";
import { refreshStaleEntries } from "../../utils/refresh";
import { refreshStaleStatusListsSaga } from "../refreshStaleStatusListsSaga";

describe("refreshStaleStatusListsSaga", () => {
  it("refreshes stale cached entries with the current IT Wallet version", () => {
    const itwVersion = "1.3.3";

    testSaga(refreshStaleStatusListsSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next(itwVersion)
      .call(refreshStaleEntries, { itwVersion })
      .next()
      .isDone();
  });
});
