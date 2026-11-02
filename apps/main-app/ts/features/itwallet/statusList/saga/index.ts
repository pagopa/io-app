import { SagaIterator } from "redux-saga";
import { call, fork, select } from "typed-redux-saga/macro";

import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { registerStatusListProperties } from "../analytics";
import { refreshStaleEntries } from "../utils/refresh";
import { checkStatusListCoherenceSaga } from "./checkStatusListCoherenceSaga";
import { registerStatusListFetchTaskSaga } from "./registerStatusListFetchTaskSaga";
import { watchItwSpecsVersionStorageSaga } from "./storeItwSpecsVersionSaga";
import { updateCredentialsStatusSaga } from "./updateCredentialsStatusSaga";

/**
 * Saga that always run on startup (even offline).
 *
 * Check status list coherence and update credentials status with the cached
 * Status List Tokens.
 */
export function* handleItwOfflineStatusListSaga(): SagaIterator {
  const itwVersion = yield* select(selectItwSpecsVersion);
  const ioWallet = getIoWallet(itwVersion);

  if (!ioWallet.CredentialStatus.statusList.isSupported) {
    return;
  }

  // Run startup coherence for the Status List Token cache
  yield* call(checkStatusListCoherenceSaga);
  // Update the validity of credentials whose status list is available in the cache
  yield* call(updateCredentialsStatusSaga, { itwVersion });
}

/**
 * Saga that runs only if device is online and triggers a refresh of stale
 * Status List Tokens.
 */
export function* handleItwStatusListSaga(): SagaIterator {
  const itwVersion = yield* select(selectItwSpecsVersion);
  const ioWallet = getIoWallet(itwVersion);

  if (!ioWallet.CredentialStatus.statusList.isSupported) {
    return;
  }

  const env = getEnv(yield* select(selectItwEnv));

  // Check for stale Status List Tokens and refresh them in the background
  yield* call(refreshStaleEntries, {
    itwVersion,
    x509CertRoot: env.X509_CERT_ROOT
  });
  // Update the validity of credentials whose status list is available in the cache
  yield* call(updateCredentialsStatusSaga, { itwVersion });
  // Register Status List super properties
  yield* call(registerStatusListProperties);
}

/**
 * Saga that runs when the user is authenticated.
 *
 * Keeps the background task for Status List fetch synchronized with the active
 * wallet and registers necessary background tasks.
 */
export function* watchItwStatusListAuthenticatedSaga(): SagaIterator {
  // Keep the background-task specs version synchronized with eID changes
  yield* fork(watchItwSpecsVersionStorageSaga);
  // Register the background task for Status List fetch only for active wallet instances
  yield* fork(registerStatusListFetchTaskSaga);
}
