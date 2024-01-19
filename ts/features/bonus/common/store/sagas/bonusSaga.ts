import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../../config";
import {
  loadAllBonusActivations,
  startLoadBonusFromIdPolling
} from "../../../bonusVacanze/store/actions/bonusVacanze";
import { handleBonusFromIdPollingSaga } from "../../../bonusVacanze/store/sagas/handleBonusFromIdPolling";
import { handleLoadAllBonusActivations } from "../../../bonusVacanze/store/sagas/handleLoadAllBonusActivationSaga";
import { BackendBonusGeneric } from "../../utils/backend";

// Saga that listen to all bonus requests
export function* watchBonusSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendBonusClient = BackendBonusGeneric(apiUrlPrefix, bearerToken);

  // start polling bonus from id
  yield* takeLatest(startLoadBonusFromIdPolling, handleBonusFromIdPollingSaga);

  // handle the all bonus activation loading request
  yield* takeLatest(
    getType(loadAllBonusActivations.request),
    handleLoadAllBonusActivations,
    backendBonusClient.getAllBonusActivations
  );
}
