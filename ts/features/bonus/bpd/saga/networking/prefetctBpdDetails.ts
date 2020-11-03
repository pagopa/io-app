import { put, take, all } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { bpdAmountLoad } from "../../store/actions/amount";
import { bpdPeriodsLoad } from "../../store/actions/periods";
import { bpdTransactionsLoad } from "../../store/actions/transactions";

/**
 * Prefetch all the BPD details data:
 * - Periods
 * - Amount foreach periods
 * - Transactions foreach period
 */
export function* prefetchBpdData() {
  yield put(bpdPeriodsLoad.request());

  const result: ActionType<
    typeof bpdPeriodsLoad.success | typeof bpdPeriodsLoad.failure
  > = yield take([
    getType(bpdPeriodsLoad.success),
    getType(bpdPeriodsLoad.failure)
  ]);

  if (result.type === getType(bpdPeriodsLoad.success)) {
    yield all(
      result.payload.map(period =>
        put(bpdAmountLoad.request(period.awardPeriodId))
      )
    );
    yield all(
      result.payload.map(period =>
        put(bpdTransactionsLoad.request(period.awardPeriodId))
      )
    );
  }
}
