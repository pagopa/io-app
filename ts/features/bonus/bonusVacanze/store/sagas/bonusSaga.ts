import { SagaIterator } from "redux-saga";
import { put, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../../config";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { ID_BONUS_VACANZE_TYPE } from "../../utils/bonus";
import {
  activateBonusVacanze,
  checkBonusVacanzeEligibility,
  loadAllBonusActivations,
  loadBonusVacanzeFromId,
  startLoadBonusFromIdPolling
} from "../actions/bonusVacanze";
import { handleBonusFromIdPollingSaga } from "./handleBonusFromIdPolling";
import { handleForceBonusServiceActivation } from "./handleForceBonusServiceActivation";
import { handleLoadAllBonusActivations } from "./handleLoadAllBonusActivationSaga";
import { handleLoadBonusVacanzeFromId } from "./handleLoadBonusVacanzeFromId";

// Saga that listen to all bonus requests
export function* watchBonusSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendBonusVacanzeClient = BackendBonusVacanze(
    apiUrlPrefix,
    bearerToken
  );

  // start polling bonus from id
  yield* takeLatest(startLoadBonusFromIdPolling, handleBonusFromIdPollingSaga);

  // handle bonus vacanze eligibility
  yield* takeLatest(
    getType(checkBonusVacanzeEligibility.request),
    function* () {
      yield* put(
        checkBonusVacanzeEligibility.failure(
          new Error("bonus vacanze activation has been dismissed")
        )
      );
    }
  );

  // handle bonus vacanze from id loading
  yield* takeEvery(
    getType(loadBonusVacanzeFromId.request),
    handleLoadBonusVacanzeFromId,
    backendBonusVacanzeClient.getLatestBonusVacanzeFromId
  );

  // handle the all bonus activation loading request
  yield* takeLatest(
    getType(loadAllBonusActivations.request),
    handleLoadAllBonusActivations,
    backendBonusVacanzeClient.getAllBonusActivations
  );

  // handle bonus vacanze activation
  yield* takeEvery(getType(activateBonusVacanze.request), function* () {
    yield* put(
      activateBonusVacanze.failure(
        new Error("bonus vacanze activation has been dismissed")
      )
    );
  });

  // force bonus vacanze service activation when eligibility or activation starts
  yield* takeLatest(
    [
      getType(activateBonusVacanze.request),
      getType(checkBonusVacanzeEligibility.request)
    ],
    handleForceBonusServiceActivation,
    ID_BONUS_VACANZE_TYPE
  );
}
