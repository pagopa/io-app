import { SagaIterator } from "redux-saga";
import { call, fork, select } from "typed-redux-saga/macro";

import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { registerStatusListProperties } from "../analytics";
import { refreshStaleEntries } from "../utils/refresh";
import { checkStatusListCoherenceSaga } from "./checkStatusListCoherenceSaga";
import { registerStatusListFetchTaskSaga } from "./registerStatusListFetchTaskSaga";
import { watchItwSpecsVersionStorageSaga } from "./storeItwSpecsVersionSaga";
import { updateCredentialsStatusSaga } from "./updateCredentialsStatusSaga";

export function* watchItwStatusListAuthenticatedSaga(): SagaIterator {
  // Keep the background-task specs version synchronized with eID changes
  yield* fork(watchItwSpecsVersionStorageSaga);
  // Register the background task for Status List fetch only for active wallet instances
  yield* fork(registerStatusListFetchTaskSaga);
}

export function* watchItwStatusListSaga(): SagaIterator {
  const itwVersion = yield* select(selectItwSpecsVersion);
  const ioWallet = getIoWallet(itwVersion);

  if (!ioWallet.CredentialStatus.statusList.isSupported) {
    return;
  }

  // Run startup coherence for the Status List Token cache
  yield* call(checkStatusListCoherenceSaga);
  // Check for stale Status List Tokens and refresh them in the background
  yield* call(refreshStaleEntries, { itwVersion });
  // Update the validity of credentials whose status list is available in the cache
  yield* call(updateCredentialsStatusSaga, { itwVersion });
  // Register Status List super properties
  yield* call(registerStatusListProperties);
}
