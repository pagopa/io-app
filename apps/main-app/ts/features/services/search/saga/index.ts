import { SagaIterator } from "redux-saga";
import { call, race, take, takeLatest } from "typed-redux-saga/macro";
import { searchPaginatedInstitutionsGet } from "../store/actions";
import { ServicesClient } from "../../../../api/ServicesClientManager";
import { handleFindInstitutions } from "./handleFindInstitutions";

export function* watchSearchSaga(servicesClient: ServicesClient): SagaIterator {
  yield* takeLatest(searchPaginatedInstitutionsGet.request, function* (action) {
    yield* race({
      task: call(
        handleFindInstitutions,
        servicesClient.findInstitutions,
        action
      ),
      cancel: take(searchPaginatedInstitutionsGet.cancel)
    });
  });
}
