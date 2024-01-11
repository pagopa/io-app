import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchItwIssuancePidSaga } from "./itwIssuancePidSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchItwPrRemoteCredentialSaga } from "./itwPrRemoteCredentialSaga";
import { watchItwIssuanceCredentialSaga } from "./itwIssuanceCredentialSaga";
import { watchItwPrProximitySaga } from "./itwPrProximitySaga";
import { watchItwPrRemotePid } from "./itwPrRemotePidSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  /* GENERIC */
  yield* fork(watchItwWiaSaga);
  yield* fork(watchItwActivationSaga);
  /* ISSUANCE */
  yield* fork(watchItwIssuancePidSaga);
  yield* fork(watchItwIssuanceCredentialSaga);
  /* PRESENTATION */
  yield* fork(watchItwPrRemotePid);
  yield* fork(watchItwPrRemoteCredentialSaga);
  yield* fork(watchItwPrProximitySaga);
}
