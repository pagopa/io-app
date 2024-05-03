import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { ServicesClient } from "../../common/api/client";
import { featuredItemsGet, paginatedInstitutionsGet } from "../store/actions";
import { handleFindInstitutions } from "./handleFindInstitutions";
import { handleGetFeaturedItems } from "./handleGetFeaturedItems";

export function* watchHomeSaga(servicesClient: ServicesClient): SagaIterator {
  yield* takeLatest(
    paginatedInstitutionsGet.request,
    handleFindInstitutions,
    servicesClient.findInstitutions
  );
  yield* takeLatest(
    featuredItemsGet.request,
    handleGetFeaturedItems,
    servicesClient.getFeaturedItems
  );
}
