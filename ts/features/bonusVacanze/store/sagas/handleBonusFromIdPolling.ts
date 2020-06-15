import { delay, SagaIterator } from "redux-saga";
import { call, put, race, take } from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import {
  cancelBonusFromId,
  loadBonusVacanzeFromId,
  startBonusFromId
} from "../actions/bonusVacanze";

/**
 * This function handles the polling of the detail of the active bonus.
 * The request occurs every 15 seconds
 * @param id the id of the bonus we need to get updated
 */
export function* bonusFromIdWorker(id: string) {
  while (true) {
    yield put(loadBonusVacanzeFromId.request(id));
    const resultAction = yield take([
      getType(loadBonusVacanzeFromId.success),
      getType(loadBonusVacanzeFromId.failure)
    ]);

    if (isActionOf(loadBonusVacanzeFromId.failure, resultAction)) {
      yield put(cancelBonusFromId());
    }

    yield call(delay, 15000);
  }
}
/**
 * This saga orchestrate the get Bonus from ID polling.
 */
export function* handleBonusFromIdPollingSaga(): SagaIterator {
  while (true) {
    const action: ActionType<typeof startBonusFromId> = yield take(
      startBonusFromId
    );
    // an event of startBonusFromId trigger a new polling to get the bonus information up to date
    yield race({
      bonusFromId: call(bonusFromIdWorker, action.payload),
      cancelAction: take(cancelBonusFromId)
    });
  }
}
