import { SagaIterator } from "redux-saga";
import { fork } from "typed-redux-saga/macro";
import { watchFimsHistorySaga } from "../../history/saga";
import { watchFimsSSOSaga } from "../../singleSignOn/saga";
import { SessionToken } from "../../../../types/SessionToken";

export function* watchFimsSaga(sessionToken: SessionToken): SagaIterator {
  yield* fork(watchFimsSSOSaga);
  yield* fork(watchFimsHistorySaga, sessionToken);
}
