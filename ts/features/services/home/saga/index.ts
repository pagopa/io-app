import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { ServicesClient } from "../../common/api/client";
import {
  featuredInstitutionsGet,
  featuredServicesGet,
  paginatedInstitutionsGet
} from "../store/actions";
import { handleFindInstitutions } from "./handleFindInstitutions";
import { handleGetFeaturedInstitutions } from "./handleGetFeaturedInstitutions";
import { handleGetFeaturedServices } from "./handleGetFeaturedServices";

export function* watchHomeSaga(servicesClient: ServicesClient): SagaIterator {
  yield* takeLatest(
    paginatedInstitutionsGet.request,
    handleFindInstitutions,
    servicesClient.findInstitutions
  );
  yield* takeLatest(
    featuredInstitutionsGet.request,
    handleGetFeaturedInstitutions,
    servicesClient.getFeaturedInstitutions
  );
  yield* takeLatest(
    featuredServicesGet.request,
    handleGetFeaturedServices,
    servicesClient.getFeaturedServices
  );
}
