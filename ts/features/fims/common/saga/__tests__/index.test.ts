import { testSaga } from "redux-saga-test-plan";
import { watchFimsSaga } from "..";
import {
  createFimsClient,
  FimsHistoryClient
} from "../../../history/api/client";
import { apiUrlPrefix } from "../../../../../config";
import { sessionTokenSelector } from "../../../../../store/reducers/authentication";
import { watchFimsSSOSaga } from "../../../singleSignOn/saga";
import { watchFimsHistorySaga } from "../../../history/saga";

describe("watchFimsSaga", () => {
  it("should create the FIMS client, obtain the session token and fork both authentication and history sagas", () => {
    const fimsClient = {} as FimsHistoryClient;
    const sessionToken = "abc123";
    testSaga(watchFimsSaga)
      .next()
      .call(createFimsClient, apiUrlPrefix)
      .next(fimsClient)
      .select(sessionTokenSelector)
      .next(sessionToken)
      .fork(watchFimsSSOSaga)
      .next()
      .fork(watchFimsHistorySaga, fimsClient, sessionToken)
      .next()
      .isDone();
  });
});
