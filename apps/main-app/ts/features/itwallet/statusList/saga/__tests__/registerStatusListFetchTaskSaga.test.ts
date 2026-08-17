import { testSaga } from "redux-saga-test-plan";

import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../../tasks";
import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";

describe("registerStatusListFetchTaskSaga", () => {
  it("registers the fetch task immediately when the wallet is valid", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsITWalletValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask);
  });

  it("waits for wallet activation before registering the fetch task", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsITWalletValidSelector)
      .next(false)
      .inspect(effect => expect(effect).toMatchObject({ type: "TAKE" }))
      .next()
      .call(registerItwStatusListFetchTask);
  });

  it("registers the fetch task again after reset and reactivation", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsITWalletValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask)
      .next()
      .take(itwLifecycleStoresReset)
      .next()
      .call(unregisterItwStatusListFetchTask)
      .next()
      .select(itwLifecycleIsITWalletValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask);
  });

  it("waits for credential storage when the wallet is still invalid after reset", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleIsITWalletValidSelector)
      .next(true)
      .call(registerItwStatusListFetchTask)
      .next()
      .take(itwLifecycleStoresReset)
      .next()
      .call(unregisterItwStatusListFetchTask)
      .next()
      .select(itwLifecycleIsITWalletValidSelector)
      .next(false)
      .inspect(effect => expect(effect).toMatchObject({ type: "TAKE" }))
      .next()
      .call(registerItwStatusListFetchTask);
  });
});
