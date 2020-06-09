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
import { handleBonusEligibilitySaga } from "./eligibility/handleBonusEligibilitySaga";
import { handleLoadAvailableBonuses } from "./handleLoadAvailableBonuses";
import { handleLoadBonusVacanzeFromId } from "./handleLoadBonusVacanzeFromId";

// Saga that listen to all bonus requests
export function* watchBonusSaga(): SagaIterator {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  // available bonus list request
  yield takeLatest(
    getType(availableBonusesLoad.request),
    handleLoadAvailableBonuses,
    backendBonusVacanze.getAvailableBonuses
  );

  yield takeLatest(
    getType(checkBonusEligibility.request),
    handleBonusEligibilitySaga
  );

  // handle bonus vacanze from id loading
  yield takeEvery(
    getType(loadBonusVacanzeFromId.request),
    handleLoadBonusVacanzeFromId,
    backendBonusVacanze.getLatestBonusVacanzeFromId
  );
}
