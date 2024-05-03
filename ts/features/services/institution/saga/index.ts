import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { ServicesClient } from "../../common/api/client";
import { paginatedServicesGet } from "../store/actions";
import { handleFindServices } from "./handleFindServices";

export function* watchInstitutionSaga(
  servicesClient: ServicesClient
): SagaIterator {
  yield* takeLatest(
    paginatedServicesGet.request,
    handleFindServices,
    servicesClient.findInstutionServices
  );
}
