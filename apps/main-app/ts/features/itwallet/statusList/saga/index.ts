import { SagaIterator } from "redux-saga";
import { call, fork, select, take } from "typed-redux-saga/macro";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
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

export function* watchItwTasksSaga(): SagaIterator {
  const isWhitelisted = yield* select(itwIsL3EnabledSelector);
  if (!isWhitelisted) {
    // If the user is not whitelisted for L3 features, we can skip background
    // task sagas as they won't have access to IT Wallet features that require
    // status list checks.
    return;
  }

  // Register the background task for Status List fetch only for active wallet instances
  yield* fork(registerStatusListFetchTaskSaga);

  // Register Status List super properties
  // TODO [SIW-4474] Add super property registration
  // yield* call(registerStatusListProperties);
}
