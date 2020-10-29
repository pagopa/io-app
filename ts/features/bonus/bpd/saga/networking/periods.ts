import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { bpdPeriodsLoad } from "../../store/actions/periods";

/**
 * Networking logic to request the periods list
 * TODO: replace with real code
 * @param _
 */
export function* bpdLoadPeriodsSaga(
  _: ActionType<typeof bpdPeriodsLoad.request>
) {
  yield delay(1000);
  yield put(bpdPeriodsLoad.success([]));
}
