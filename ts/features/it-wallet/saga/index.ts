import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchPidSaga } from "./itwPidIssuanceSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchitwPrRemoteCredentialSaga } from "./presentation/remote/itwPrRemoteCredentialSaga";
import { watchItwIssuanceSaga } from "./new/itwIssuanceSaga";
import { watchItwProximitySaga } from "./itwProximitySaga";
import { watchItwRpSaga } from "./presentation/remote/itwPrRemotePidSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  yield* fork(watchItwActivationSaga);
  yield* fork(watchItwWiaSaga);
  yield* fork(watchPidSaga);
  yield* fork(watchItwRpSaga);
  yield* fork(watchitwPrRemoteCredentialSaga);
  yield* fork(watchItwIssuanceSaga);
  yield* fork(watchItwProximitySaga);
}
