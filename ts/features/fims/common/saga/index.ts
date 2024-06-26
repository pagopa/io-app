import { SagaIterator } from "redux-saga";
import { fork } from "typed-redux-saga/macro";
import { watchFimsSSOSaga } from "../../singleSignOn/saga";

export function* watchFimsSaga(): SagaIterator {
  yield* fork(watchFimsSSOSaga);
}
