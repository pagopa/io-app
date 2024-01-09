import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchPidSaga } from "./itwPidIssuanceSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchItwRpSaga } from "./itwRpSaga";
import { watchItwPresentationSaga } from "./new/itwPresentationSaga";
import { watchItwIssuanceSaga } from "./new/itwIssuanceSaga";
import { watchItwProximitySaga } from "./itwProximitySaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  yield* fork(watchItwActivationSaga);
  yield* fork(watchItwWiaSaga);
  yield* fork(watchPidSaga);
  yield* fork(watchItwRpSaga);
  yield* fork(watchItwPresentationSaga);
  yield* fork(watchItwIssuanceSaga);
  yield* fork(watchItwProximitySaga);
}
