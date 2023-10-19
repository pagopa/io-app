import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchPidSaga } from "./itwPidSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwCredentialsSaga } from "./itwCredentialsSaga";
import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchItwRpSaga } from "./itwRpSaga";
import { watchItwPresentationSaga } from "./new/itwPresentationSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  yield* fork(watchItwActivationSaga);
  yield* fork(watchItwWiaSaga);
  yield* fork(watchPidSaga);
  yield* fork(watchItwCredentialsSaga);
  yield* fork(watchItwRpSaga);
  yield* fork(watchItwPresentationSaga);
}
