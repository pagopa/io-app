import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  availableBonusesLoad,
  checkBonusEligibility,
  loadBonusVacanzeFromId
} from "../actions/bonusVacanze";
import { handleLoadAvailableBonuses } from "./handleLoadAvailableBonuses";
import { handleLoadBonusVacanzeFromId } from "./handleLoadBonusVacanzeFromId";
import { startBonusEligibilitySaga } from "./startBonusEligibilitySaga";

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
    backendBonusVacanze.postEligibilityCheck,
    backendBonusVacanze.getEligibilityCheck
  );

  // handle bonus vacanze from id loading
  yield takeEvery(
    getType(loadBonusVacanzeFromId.request),
    handleLoadBonusVacanzeFromId,
    backendBonusVacanze.getBonusVacanzeFromId
  );
}
