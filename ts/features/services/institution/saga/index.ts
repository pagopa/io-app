import { SagaIterator } from "redux-saga";
import { call, race, take, takeLatest } from "typed-redux-saga/macro";
import { ServicesClient } from "../../common/api/servicesClient";
import { paginatedServicesGet } from "../store/actions";
import { handleFindInstitutionServices } from "./handleFindInstitutionServices";

export function* watchInstitutionSaga(
  servicesClient: ServicesClient
): SagaIterator {
  yield* takeLatest(paginatedServicesGet.request, function* (action) {
    yield* race({
      task: call(
        handleFindInstitutionServices,
        servicesClient.findInstutionServices,
        action
      ),
      cancel: take(paginatedServicesGet.cancel)
    });
  });
}
