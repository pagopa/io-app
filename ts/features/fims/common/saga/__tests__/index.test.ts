import { testSaga } from "redux-saga-test-plan";
import { watchFimsSaga } from "..";
import { watchFimsSSOSaga } from "../../../singleSignOn/saga";
import { watchFimsHistorySaga } from "../../../history/saga";
import { SessionToken } from "../../../../../types/SessionToken";

describe("watchFimsSaga", () => {
  it("should create the FIMS client, obtain the session token and fork both authentication and history sagas", () => {
    const sessionToken = "abc123" as SessionToken;
    testSaga(watchFimsSaga, sessionToken)
      .next()
      .fork(watchFimsSSOSaga)
      .next()
      .fork(watchFimsHistorySaga, sessionToken)
      .next()
      .isDone();
  });
});
