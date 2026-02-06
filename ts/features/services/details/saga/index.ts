import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "typed-redux-saga/macro";
import {
  IDBackendClient,
  SEBackendClient
} from "../../../../api/BackendClientManager";
import { ServicesClient } from "../../common/api/servicesClient";
import {
  loadServicePreference,
  upsertServicePreference
} from "../store/actions/preference";
import { loadServiceDetail } from "../store/actions/details";
import { handleGetServicePreference } from "./handleGetServicePreference";
import { handleUpsertServicePreference } from "./handleUpsertServicePreference";
import { handleServiceDetails } from "./handleServiceDetails";

export function* watchServicesDetailsSaga(
  identityClient: IDBackendClient,
  servicesClient: ServicesClient | SEBackendClient
): SagaIterator {
  // handle the single load service request
  yield* takeEvery(
    loadServiceDetail.request,
    handleServiceDetails,
    servicesClient.getServiceById
  );

  // handle the load of service preference request
  yield* takeLatest(
    loadServicePreference.request,
    handleGetServicePreference,
    identityClient.getServicePreferences
  );

  // handle the upsert request for the current service
  yield* takeLatest(
    upsertServicePreference.request,
    handleUpsertServicePreference,
    identityClient.upsertServicePreferences
  );
}
