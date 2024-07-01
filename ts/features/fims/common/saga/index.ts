import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { createFimsClient } from "../../history/api/client";
import { watchFimsHistorySaga } from "../../history/saga";
import { watchFimsSSOSaga } from "../../singleSignOn/saga";

const FIMS_DEV_ENV_TOKEN = "";

export function* watchFimsSaga(): SagaIterator {
  const fimsClient = createFimsClient(apiUrlPrefix);

  const fimsToken = yield* select(sessionTokenSelector);
  yield* fork(watchFimsSSOSaga);
  yield* fork(
    watchFimsHistorySaga,
    fimsClient,
    fimsToken ?? FIMS_DEV_ENV_TOKEN
  );
}
