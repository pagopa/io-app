import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { bpdAmountLoad } from "../../store/actions/amount";

/**
 * Networking code to request the amount for a specified period.
 * TODO: replace with real code
 * @param action
 */
export function* bpdLoadAmountSaga(
  action: ActionType<typeof bpdAmountLoad.request>
) {
  yield delay(1000);
  yield put(
    bpdAmountLoad.success({
      awardPeriodId: action.payload,
      totalCashback: 25.25,
      transactionNumber: 2
    })
  );
}
