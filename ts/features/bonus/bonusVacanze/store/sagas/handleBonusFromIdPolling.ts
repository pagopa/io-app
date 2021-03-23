import { SagaIterator } from "@redux-saga/core";
import { Millisecond } from "italia-ts-commons/lib/units";
import { delay } from "redux-saga/effects";
import { call, put, race, take } from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import {
  cancelLoadBonusFromIdPolling,
  loadBonusVacanzeFromId,
  startLoadBonusFromIdPolling
} from "../actions/bonusVacanze";

const POLLING_FREQ_TIMEOUT = 5000 as Millisecond;
/**
 * This function handles the polling of the detail of the active bonus.
 * The request occurs every 5 seconds
 * @param id the id of the bonus we need to get updated
 */
export function* bonusFromIdWorker(bonusId: string): SagaIterator {
  while (true) {
    yield put(loadBonusVacanzeFromId.request(bonusId));
    const resultAction = yield take([
      getType(loadBonusVacanzeFromId.success),
      getType(loadBonusVacanzeFromId.failure)
    ]);

    if (isActionOf(loadBonusVacanzeFromId.failure, resultAction)) {
      yield put(cancelLoadBonusFromIdPolling());
    }
    yield delay(POLLING_FREQ_TIMEOUT);
  }
}
/**
 * This saga orchestrate the get Bonus from ID polling.
 */
export function* handleBonusFromIdPollingSaga(
  action: ActionType<typeof startLoadBonusFromIdPolling>
): SagaIterator {
  yield race({
    polling: call(bonusFromIdWorker, action.payload),
    cancelPolling: take(cancelLoadBonusFromIdPolling)
  });
}
