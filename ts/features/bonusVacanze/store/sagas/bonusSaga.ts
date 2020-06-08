import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  availableBonusesLoad,
  checkBonusEligibility,
  loadBonusVacanzeFromId,
  startBonusActivation
} from "../actions/bonusVacanze";
import { startBonusEligibilitySaga } from "./handleBonusEligibilitySaga";
import { handleLoadAvailableBonuses } from "./handleLoadAvailableBonuses";
import { handleLoadBonusVacanzeFromId } from "./handleLoadBonusVacanzeFromId";
import { startBonusActivationSaga } from "./handleStartBonusActivationSaga";

// Saga that listen to all bonus requests
export function* watchBonusSaga(): SagaIterator {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  // available bonus list request
  yield takeLatest(
    getType(availableBonusesLoad.request),
    handleLoadAvailableBonuses,
    backendBonusVacanze.getAvailableBonuses
  );

  // start bonus eligibility check and polling for result
  yield takeLatest(
    getType(checkBonusEligibility.request),
    startBonusEligibilitySaga,
    backendBonusVacanze.startBonusEligibilityCheck,
    backendBonusVacanze.getBonusEligibilityCheck
  );

  // handle bonus vacanze from id loading
  yield takeEvery(
    getType(loadBonusVacanzeFromId.request),
    handleLoadBonusVacanzeFromId,
    backendBonusVacanze.getLatestBonusVacanzeFromId
  );

  // handle bonus vacanze activation
  yield takeEvery(
    getType(startBonusActivation.request),
    startBonusActivationSaga,
    backendBonusVacanze.startBonusActivationProcedure,
    backendBonusVacanze.getLatestBonusVacanzeFromId
  );
}
