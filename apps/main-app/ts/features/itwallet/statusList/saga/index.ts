import { SagaIterator } from "redux-saga";
import { call, fork, select } from "typed-redux-saga/macro";

import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { registerStatusListProperties } from "../analytics";
import { checkStatusListCoherenceSaga } from "./checkStatusListCoherenceSaga";
import { refreshStaleStatusListsSaga } from "./refreshStaleStatusListsSaga";
import { registerStatusListFetchTaskSaga } from "./registerStatusListFetchTaskSaga";

export function* watchItwStatusListAuthenticatedSaga(): SagaIterator {
  const itwSpecsVersion = yield* select(selectItwSpecsVersion);
  const ioWallet = getIoWallet(itwSpecsVersion);

  if (!ioWallet.CredentialStatus.statusList.isSupported) {
    return;
  }

  // Register the background task for Status List fetch only for active wallet instances
  yield* fork(registerStatusListFetchTaskSaga);
}

export function* watchItwStatusListSaga(): SagaIterator {
  const itwSpecsVersion = yield* select(selectItwSpecsVersion);
  const ioWallet = getIoWallet(itwSpecsVersion);

  if (!ioWallet.CredentialStatus.statusList.isSupported) {
    return;
  }

  // Run startup coherence for the Status List Token cache
  yield* call(checkStatusListCoherenceSaga);
  // Check for stale Status List Tokens and refresh them in the background
  yield* call(refreshStaleStatusListsSaga);
  // Register Status List super properties
  yield* call(registerStatusListProperties);
}
