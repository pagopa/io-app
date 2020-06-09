import { SagaIterator } from "redux-saga";
import { all, call, put } from "redux-saga/effects";
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { SagaCallReturnType } from "../../../../types/utils";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  bonusActivationRequestProgress,
  startBonusActivation
} from "../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../reducers/bonusVacanzeActivation";
import { Millisecond } from "italia-ts-commons/lib/units";
import { startTimer } from "../../../../utils/timer";

// wait time between requests
const bonusActivationResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

export function* startBonusActivationSaga(
  startBonusActivationProcedure: ReturnType<
    typeof BackendBonusVacanze
  >["startBonusActivationProcedure"],
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"]
): SagaIterator {
  try {
    yield put(
      bonusActivationRequestProgress(BonusActivationProgressEnum.PROGRESS)
    );
    const startBonusActivationProcedureResult: SagaCallReturnType<
      typeof startBonusActivationProcedure
    > = yield call(startBonusActivationProcedure, {});
    if (startBonusActivationProcedureResult.isRight()) {
      const status = startBonusActivationProcedureResult.value.status;
      // 202 -> Request accepted.
      // 409 -> Cannot activate a new bonus because another bonus related to this user was found.
      if (status === 202 || status === 409) {
        // start polling to know about the check result
        const startPollingTime = new Date().getTime();
        while (true) {
          // sleep
          yield call(startTimer, bonusActivationResultPolling);
        }
      }
      // eligibility expired
      else if (status === 403) {
        yield put(
          bonusActivationRequestProgress(
            BonusActivationProgressEnum.ELIGIBILITY_EXPIRED
          )
        );
      }
      throw Error(
        `response status ${startBonusActivationProcedureResult.value.status}`
      );
    }
    RTron.log(startBonusActivationProcedureResult);
  } catch (e) {
    yield all([
      put(bonusActivationRequestProgress(BonusActivationProgressEnum.ERROR)),
      put(startBonusActivation.failure(e))
    ]);
  }
}
