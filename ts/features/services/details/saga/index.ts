import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "typed-redux-saga/macro";
import { BackendClient } from "../../../../api/backend";
import {
  loadServicePreference,
  upsertServicePreference
} from "../store/actions/preference";
import { loadServiceDetail } from "../store/actions/details";
import { handleGetServicePreference } from "./handleGetServicePreference";
import { handleUpsertServicePreference } from "./handleUpsertServicePreference";
import { handleServiceDetails } from "./handleServiceDetails";

/**
 * Handle payment method onboarding requests
 * @param walletClient wallet client
 */
export function* watchServicesDetailsSaga(
  backendClient: BackendClient
): SagaIterator {
  // handle the single load service request
  yield* takeEvery(
    loadServiceDetail.request,
    handleServiceDetails,
    backendClient.getService
  );

  // handle the load of service preference request
  yield* takeLatest(
    loadServicePreference.request,
    handleGetServicePreference,
    backendClient.getServicePreference
  );

  // handle the upsert request for the current service
  yield* takeLatest(
    upsertServicePreference.request,
    handleUpsertServicePreference,
    backendClient.upsertServicePreference
  );
}
