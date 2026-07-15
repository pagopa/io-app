import { SagaIterator } from "redux-saga";
import { call, select, take } from "typed-redux-saga/macro";

import { itwCredentialsStore } from "../../credentials/store/actions";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../tasks/manager";

/** Registers the ITW Status List fetch task with expo-background-task. */
export function* registerStatusListFetchTaskSaga(): SagaIterator {
  while (true) {
    const isWalletValid = yield* select(itwLifecycleIsValidSelector);
    if (!isWalletValid) {
      // Wait for a credential store, a strong signal of wallet activation.
      yield* take(itwCredentialsStore);
    }

    // Register only for active wallet instances (idempotent).
    yield* call(registerItwStatusListFetchTask);

    // On wallet reset, unregister and loop to await the next reactivation.
    yield* take(itwLifecycleStoresReset);
    yield* call(unregisterItwStatusListFetchTask);
  }
}
