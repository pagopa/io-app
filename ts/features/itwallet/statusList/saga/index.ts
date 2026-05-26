import { SagaIterator } from "redux-saga";
import { call, select, take, takeLatest } from "typed-redux-saga/macro";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import {
  registerStatusListProperties,
  trackItwStatusListLastCheckTime
} from "../analytics";
import {
  registerItwStatusListFetchTask,
  unregisterItwStatusListFetchTask
} from "../tasks";
import { getLastStatusListCheckTimestamp } from "../utils/storage";

/**
 * Registers the ITW Status List fetch task with expo-background-task.
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
      trackItwStatusListLastCheckTime,
      new Date(timestamp).toISOString()
    );
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
  yield* call(registerStatusListFetchTaskSaga);

  // Register Status List super properties
  yield* call(registerStatusListProperties);
  // Track the last execution of the ITW Status List fetch task
  yield* call(trackLastStatusListFetchTaskSaga);
}
