import { select } from "redux-saga-test-plan/matchers";
import { all, put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { loadAbi } from "../../../../wallet/onboarding/bancomat/store/actions";
import { abiSelector } from "../../../../wallet/onboarding/store/abi";
import { isReady } from "../../model/RemoteValue";
import { bpdAmountLoad } from "../../store/actions/amount";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { bpdPeriodsLoad } from "../../store/actions/periods";
import { bpdTransactionsLoad } from "../../store/actions/transactions";

/**
 * Prefetch all the BPD details data:
 * - Activation Status
 * - Abi list
 * - Periods
 * - Amount foreach periods
 * - Transactions foreach period
 */
export function* prefetchBpdData() {
  yield put(bpdLoadActivationStatus.request());
  yield put(bpdPeriodsLoad.request());

  const abiList: ReturnType<typeof abiSelector> = yield select(abiSelector);

  // The volatility of the bank list is extremely low.
  // There is no need to refresh it every time.
  // A further refinement could be to insert an expiring cache
  if (!isReady(abiList)) {
    yield put(loadAbi.request());
  }

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
