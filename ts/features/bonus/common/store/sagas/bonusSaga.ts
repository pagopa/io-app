import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../../config";
import { BackendBonusGeneric } from "../../utils/backend";
import { loadAllBonusActivations } from "../actions/availableBonusesTypes";
import { handleLoadAllBonusActivations } from "./handleLoadAllBonusActivationSaga";

// Saga that listen to all bonus requests
export function* watchBonusSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendBonusClient = BackendBonusGeneric(apiUrlPrefix, bearerToken);

  // handle the all bonus activation loading request
  yield* takeLatest(
    getType(loadAllBonusActivations.request),
    handleLoadAllBonusActivations,
    backendBonusClient.getAllBonusActivations
  );
}
