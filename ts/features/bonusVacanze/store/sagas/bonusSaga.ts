import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { apiUrlPrefix, contentRepoUrl } from "../../../../config";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  availableBonusesLoad,
  bonusVacanzeActivation,
  checkBonusEligibility,
  loadBonusVacanzeFromId
} from "../actions/bonusVacanze";
import { startBonusActivationSaga } from "./bonusActivation/handleStartBonusActivationSaga";
import { startBonusEligibilitySaga } from "./handleBonusEligibilitySaga";
import { handleLoadAvailableBonuses } from "./handleLoadAvailableBonuses";
import { handleLoadBonusVacanzeFromId } from "./handleLoadBonusVacanzeFromId";

// Saga that listen to all bonus requests
export function* watchBonusSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendBonusVacanze = BackendBonusVacanze(
    apiUrlPrefix,
    contentRepoUrl,
    bearerToken
  );
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
    getType(bonusVacanzeActivation.request),
    startBonusActivationSaga,
    backendBonusVacanze.startBonusActivationProcedure,
    backendBonusVacanze.getLatestBonusVacanzeFromId
  );
}
