import { SagaIterator } from "redux-saga";
import { call, fork, select, take, takeLatest } from "typed-redux-saga/macro";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { trackItwStatusListLastChecktime } from "../analytics";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../tasks";
import { getLastStatusListCheckTimestamp } from "../utils/storage";

/**
 * Registers the ITW Status List fetch task with expo-background-task.
 *
 * This is a fire-and-forget operation: if the background task API is not
 * available (e.g. restricted by the OS), the registration is silently skipped.
 * The task must be defined in global scope via TaskManager.defineTask before
 * this saga is called (see ts/features/itwallet/background/tasks.ts).
 */
export function* registerStatusListFetchTaskSaga(): SagaIterator {
  const isWalletValid = yield* select(itwLifecycleIsValidSelector);
  if (!isWalletValid) {
    // If wallet not valid, wait for a credential store, which is a strong
    // signal of wallet activation.
    yield* take(itwCredentialsStore);
  }

  // Register the background task for Status List fetch only for active wallet
  // instances
  yield* call(registerItwStatusListFetchTask);

  // Unregister background tasks on wallet reset
  yield* takeLatest(itwLifecycleWalletReset, function* () {
    yield* call(unregisterItwStatusListFetchTask);
  });
}

/**
 * Tracks the last execution of the ITW Status List fetch task on app open,
 * to have a baseline for the background fetch frequency.
 *
 * TODO: remove once the status list is implemented
 */
export function* trackLastStatusListFetchTaskSaga(): SagaIterator {
  const timestamp = yield* call(getLastStatusListCheckTimestamp);
  if (timestamp) {
    yield* call(
      trackItwStatusListLastChecktime,
      new Date(timestamp).toISOString()
    );
  }
}

export function* watchItwTasksSaga(): SagaIterator {
  // TODO: remove once the status list is implemented
  yield* fork(trackLastStatusListFetchTaskSaga);
  // Register the background task for Status List fetch only for active wallet instances
  yield* call(registerStatusListFetchTaskSaga);
}
