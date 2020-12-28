import { select, take } from "redux-saga-test-plan/matchers";
import { all, call, put } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { loadAbi } from "../../../../wallet/onboarding/bancomat/store/actions";
import { abiSelector } from "../../../../wallet/onboarding/store/abi";
import { isReady } from "../../model/RemoteValue";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { bpdPeriodsAmountLoad } from "../../store/actions/periods";
import { bpdTransactionsLoad } from "../../store/actions/transactions";
import { backoffWait } from "../../../../../utils/saga";

/**
 * Load all the BPD details data:
 * - Activation Status
 * - Abi list
 * - Periods
 * - Amount foreach period !== "Inactive"
 * - Transactions foreach period !== "Inactive"
 */
export function* loadBpdData() {
  // wait if some previous errors occurred
  yield call(backoffWait, getType(bpdLoadActivationStatus.failure));
  yield put(bpdLoadActivationStatus.request());

  const abiList: ReturnType<typeof abiSelector> = yield select(abiSelector);

  // The volatility of the bank list is extremely low.
  // There is no need to refresh it every time.
  // A further refinement could be to insert an expiring cache
  if (!isReady(abiList)) {
    yield put(loadAbi.request());
  }

  yield put(bpdPeriodsAmountLoad.request());

  const periods: ActionType<
    typeof bpdPeriodsAmountLoad.success | typeof bpdPeriodsAmountLoad.failure
  > = yield take([
    getType(bpdPeriodsAmountLoad.success),
    getType(bpdPeriodsAmountLoad.failure)
  ]);

  if (periods.type === getType(bpdPeriodsAmountLoad.success)) {
    yield all(
      periods.payload
        .filter(p => p.status !== "Inactive")
        .map(period => put(bpdTransactionsLoad.request(period.awardPeriodId)))
    );
  }
}
