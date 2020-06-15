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
import { bonusActivationSaga } from "./activation/getBonusActivationSaga";
import { handleBonusActivationSaga } from "./activation/handleBonusActivationSaga";
import { bonusEligibilitySaga } from "./eligibility/getBonusEligibilitySaga";
import { handleBonusEligibilitySaga } from "./eligibility/handleBonusEligibilitySaga";
import { handleLoadAvailableBonuses } from "./handleLoadAvailableBonuses";
import { handleLoadBonusVacanzeFromId } from "./handleLoadBonusVacanzeFromId";

// Saga that listen to all bonus requests
export function* watchBonusSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendBonusVacanzeClient = BackendBonusVacanze(
    apiUrlPrefix,
    contentRepoUrl,
    bearerToken
  );
  // available bonus list request
  yield takeLatest(
    getType(availableBonusesLoad.request),
    handleLoadAvailableBonuses,
    backendBonusVacanzeClient.getAvailableBonuses
  );

  // handle bonus vacanze eligibility
  yield takeLatest(
    getType(checkBonusEligibility.request),
    handleBonusEligibilitySaga,
    bonusEligibilitySaga(
      backendBonusVacanzeClient.startBonusEligibilityCheck,
      backendBonusVacanzeClient.getBonusEligibilityCheck
    )
  );

  // handle bonus vacanze from id loading
  yield takeEvery(
    getType(loadBonusVacanzeFromId.request),
    handleLoadBonusVacanzeFromId,
    backendBonusVacanzeClient.getLatestBonusVacanzeFromId
  );

  // handle bonus vacanze activation
  yield takeEvery(
    getType(bonusVacanzeActivation.request),
    handleBonusActivationSaga,
    bonusActivationSaga(
      backendBonusVacanzeClient.startBonusActivationProcedure,
      backendBonusVacanzeClient.getLatestBonusVacanzeFromId
    )
  );
}
