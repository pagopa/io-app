import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchItwIssuancePidSaga } from "./issuance/pid/itwIssuancePidSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchitwPrRemoteCredentialSaga } from "./presentation/remote/itwPrRemoteCredentialSaga";
import { watchItwIssuanceCredentialSaga } from "./issuance/itwIssuanceCredentialSaga";
import { watchItwProximitySaga } from "./itwProximitySaga";
import { watchItwRpSaga } from "./presentation/remote/itwPrRemotePidSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  yield* fork(watchItwActivationSaga);
  yield* fork(watchItwWiaSaga);
  yield* fork(watchItwIssuancePidSaga);
  yield* fork(watchItwRpSaga);
  yield* fork(watchitwPrRemoteCredentialSaga);
  yield* fork(watchItwIssuanceCredentialSaga);
  yield* fork(watchItwProximitySaga);
}
