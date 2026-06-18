import { testSaga } from "redux-saga-test-plan";
import { itwCredentialsStore } from "../../../credentials/store/actions";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import {
  registerStatusListFetchTaskSaga,
  startupStatusListCoherenceSaga
} from "..";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../../tasks";
import { refreshStaleEntries, startupCoherence } from "../../utils/cache";
import { itwStatusListReferencedUrisSelector } from "../../store/selectors";

describe("registerStatusListFetchTaskSaga", () => {
  it("registers the fetch task immediately when the wallet is valid", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask);
  });

  it("waits for wallet activation before registering the fetch task", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsValidSelector)
      .next(false)
      .take(itwCredentialsStore)
      .next()
      .call(registerItwStatusListFetchTask);
  });

  it("registers the fetch task again after reset and reactivation", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask)
      .next()
      .take(itwLifecycleStoresReset)
      .next()
      .call(unregisterItwStatusListFetchTask)
      .next()
      .select(itwLifecycleIsValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask);
  });
});

describe("startupStatusListCoherenceSaga", () => {
  it("prunes unreferenced entries, then refreshes the stale ones", () => {
    const referencedUris = ["https://issuer.example/status/1"];

    testSaga(startupStatusListCoherenceSaga)
      .next()
      .select(itwStatusListReferencedUrisSelector)
      .next(referencedUris)
      .call(startupCoherence, referencedUris)
      .next()
      .call(refreshStaleEntries)
      .next()
      .isDone();
  });
});
