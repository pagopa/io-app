import { SagaIterator } from "redux-saga";
import { fork } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { watchHomeSaga } from "../../home/saga";
import { createServicesClient } from "../api/client";

export function* watchServicesSaga(): SagaIterator {
  const servicesClient = createServicesClient(apiUrlPrefix);

  yield* fork(watchHomeSaga, servicesClient);
}
