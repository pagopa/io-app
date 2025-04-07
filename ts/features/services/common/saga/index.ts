import { SagaIterator } from "redux-saga";
import { fork } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { watchHomeSaga } from "../../home/saga";
import { watchInstitutionSaga } from "../../institution/saga";
import { watchSearchSaga } from "../../search/saga";
import { createServicesClient } from "../api/client";
import { watchServicesDetailsSaga } from "../../details/saga";
import { BackendClient } from "../../../../api/backend";

export function* watchServicesSaga(
  backendClient: BackendClient,
  bearerToken: SessionToken
): SagaIterator {
  const servicesClient = createServicesClient(apiUrlPrefix, bearerToken);

  yield* fork(watchServicesDetailsSaga, backendClient, servicesClient);
  yield* fork(watchHomeSaga, servicesClient);
  yield* fork(watchInstitutionSaga, servicesClient);
  yield* fork(watchSearchSaga, servicesClient);
}
