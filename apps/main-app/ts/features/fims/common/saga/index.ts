import { SagaIterator } from "redux-saga";
import { fork } from "typed-redux-saga/macro";
import { watchFimsHistorySaga } from "../../history/saga";
import { watchFimsSSOSaga } from "../../singleSignOn/saga";

export function* watchFimsSaga(sessionToken: string): SagaIterator {
  yield* fork(watchFimsSSOSaga);
  yield* fork(watchFimsHistorySaga, sessionToken);
}
