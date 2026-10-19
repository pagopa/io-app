import { testSaga } from "redux-saga-test-plan";

import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../../common/store/selectors/environment";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  ItwLifecycleState,
  itwLifecycleStateSelector
} from "../../../lifecycle/store/selectors";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../../tasks";
import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";

const ITW_VERSION = "1.3.3";

describe("registerStatusListFetchTaskSaga", () => {
  it("registers the fetch task immediately when the wallet is valid", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleStateSelector)
      .next(ItwLifecycleState.IT_WALLET)
      .select(selectItwSpecsVersion)
      .next(ITW_VERSION)
      .select(selectItwEnv)
      .next("prod")
      .call(registerItwStatusListFetchTask, ITW_VERSION, "prod");
  });

  it("waits for wallet activation before registering the fetch task", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleStateSelector)
      .next(ItwLifecycleState.DOC_IO)
      .inspect(effect => expect(effect).toMatchObject({ type: "TAKE" }))
      .next()
      .select(selectItwSpecsVersion)
      .next(ITW_VERSION)
      .select(selectItwEnv)
      .next("prod")
      .call(registerItwStatusListFetchTask, ITW_VERSION, "prod");
  });

  it("registers the fetch task again after reset and reactivation", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleStateSelector)
      .next(ItwLifecycleState.IT_WALLET)
      .select(selectItwSpecsVersion)
      .next(ITW_VERSION)
      .select(selectItwEnv)
      .next("prod")
      .call(registerItwStatusListFetchTask, ITW_VERSION, "prod")
      .next()
      .take(itwLifecycleStoresReset)
      .next()
      .call(unregisterItwStatusListFetchTask)
      .next()
      .select(itwLifecycleStateSelector)
      .next(ItwLifecycleState.IT_WALLET)
      .select(selectItwSpecsVersion)
      .next(ITW_VERSION)
      .select(selectItwEnv)
      .next("prod")
      .call(registerItwStatusListFetchTask, ITW_VERSION, "prod");
  });

  it("waits for credential storage when the wallet is still invalid after reset", () => {
    testSaga(registerStatusListFetchTaskSaga)
      .next()
      .select(itwLifecycleStateSelector)
      .next(ItwLifecycleState.IT_WALLET)
      .select(selectItwSpecsVersion)
      .next(ITW_VERSION)
      .select(selectItwEnv)
      .next("prod")
      .call(registerItwStatusListFetchTask, ITW_VERSION, "prod")
      .next()
      .take(itwLifecycleStoresReset)
      .next()
      .call(unregisterItwStatusListFetchTask)
      .next()
      .select(itwLifecycleStateSelector)
      .next(ItwLifecycleState.DOC_IO)
      .inspect(effect => expect(effect).toMatchObject({ type: "TAKE" }))
      .next()
      .select(selectItwSpecsVersion)
      .next(ITW_VERSION)
      .select(selectItwEnv)
      .next("prod")
      .call(registerItwStatusListFetchTask, ITW_VERSION, "prod");
  });
});
