import { SagaIterator } from "redux-saga";
import { fork } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { watchHomeSaga } from "../../home/saga";
import { createServicesClient } from "../api/client";

export function* watchServicesSaga(bearerToken: SessionToken): SagaIterator {
  const servicesClient = createServicesClient(apiUrlPrefix, bearerToken);

  yield* fork(watchHomeSaga, servicesClient);
}
