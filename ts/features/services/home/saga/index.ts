import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { ServicesClient } from "../../common/api/client";
import { paginatedInstitutionsGet } from "../store/actions";
import { handleFindInstitutions } from "./handleFindInstitutions";

export function* watchHomeSaga(servicesClient: ServicesClient): SagaIterator {
  yield* takeLatest(
    paginatedInstitutionsGet.request,
    handleFindInstitutions,
    servicesClient.findInstitutions
  );
}
