import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchItwIssuancePidSaga } from "./issuance/pid/itwIssuancePidSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchitwPrRemoteCredentialSaga } from "./presentation/remote/itwPrRemoteCredentialSaga";
import { watchItwIssuanceCredentialSaga } from "./issuance/itwIssuanceCredentialSaga";
import { watchItwPrProximitySaga } from "./presentation/proximity/itwPrProximitySaga";
import { watchItwPrRemotePid } from "./presentation/remote/itwPrRemotePidSaga";

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
  yield* fork(watchitwPrRemoteCredentialSaga);
  yield* fork(watchItwPrProximitySaga);
}
