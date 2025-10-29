import { SagaIterator } from "redux-saga";
import { call, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { BackendClient } from "../../../../api/backend";
import { ServicesClient } from "../../common/api/client";
import {
  loadServicePreference,
  upsertServicePreference
} from "../store/actions/preference";
import { loadServiceDetail } from "../store/actions/details";
import {
  getFavouriteService,
  toggleFavouriteService
} from "../store/actions/favourite";
import { handleGetServicePreference } from "./handleGetServicePreference";
import { handleUpsertServicePreference } from "./handleUpsertServicePreference";
import { handleServiceDetails } from "./handleServiceDetails";
import {
  handleGetFavouriteService,
  handleToggleFavouriteService
} from "./handleFavouriteService";

export function* watchServicesDetailsSaga(
  backendClient: BackendClient,
  servicesClient: ServicesClient
): SagaIterator {
  // handle the request to load service details
  yield* takeEvery(
    loadServiceDetail.request,
    handleServiceDetails,
    servicesClient.getServiceById
  );

  // handle the request to load the service preference
  yield* takeLatest(
    loadServicePreference.request,
    handleGetServicePreference,
    backendClient.getServicePreference
  );

  // handle the request to upsert the service preference
  yield* takeLatest(
    upsertServicePreference.request,
    handleUpsertServicePreference,
    backendClient.upsertServicePreference
  );

  // handle the request to get the favourite service
  yield* takeLatest(
    getFavouriteService.request,
    handleGetFavouriteService,
    servicesClient.getUserFavouriteService
  );

  // handle the request to toggle the favourite service
  yield* takeLatest(toggleFavouriteService.request, function* (action) {
    const { isFavourite } = action.payload;

    yield* call(
      handleToggleFavouriteService,
      isFavourite
        ? servicesClient.setUserFavouriteService
        : servicesClient.removeUserFavouriteService,
      action
    );
  });
}
