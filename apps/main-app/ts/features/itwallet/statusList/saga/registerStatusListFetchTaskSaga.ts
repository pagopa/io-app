import { SagaIterator } from "redux-saga";
import { call, select, take } from "typed-redux-saga/macro";

import { waitForItWalletActivation } from "../../common/saga/utils";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../tasks";

/** Registers the ITW Status List fetch task with expo-background-task. */
export function* registerStatusListFetchTaskSaga(): SagaIterator {
  while (true) {
    const isItWalletValid = yield* select(itwLifecycleIsITWalletValidSelector);
    if (!isItWalletValid) {
      // If the wallet is not valid or the Status List is not supported, wait
      // for wallet activation before proceeding.
      yield* waitForItWalletActivation();
    }

    // Register only for active wallet instances (idempotent).
    const itwVersion = yield* select(selectItwSpecsVersion);
    yield* call(registerItwStatusListFetchTask, itwVersion);

    // On wallet reset, unregister and loop to await the next reactivation.
    yield* take(itwLifecycleStoresReset);
    yield* call(unregisterItwStatusListFetchTask);
  }
}
