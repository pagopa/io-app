import { select, take } from "redux-saga-test-plan/matchers";
import { all, call, delay, put } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { loadAbi } from "../../../../wallet/onboarding/bancomat/store/actions";
import { abiSelector } from "../../../../wallet/onboarding/store/abi";
import { isReady } from "../../model/RemoteValue";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { bpdPeriodsAmountLoad } from "../../store/actions/periods";
import { bpdTransactionsLoad } from "../../store/actions/transactions";
import { getBackoffTime } from "../../../../../utils/saga";
import { SagaCallReturnType } from "../../../../../types/utils";

/**
 * retrieve possible backoff waiting time and if there are, wait that time
 */
function* checkPreviousFailures() {
  // wait if some previous errors occurred
  const loadActivationBackOff: SagaCallReturnType<typeof getBackoffTime> = yield call(
    getBackoffTime,
    bpdLoadActivationStatus.failure
  );
  const loadPeriodsBackOff: SagaCallReturnType<typeof getBackoffTime> = yield call(
    getBackoffTime,
    bpdPeriodsAmountLoad.failure
  );
  const waitingTime = Math.max(loadActivationBackOff, loadPeriodsBackOff);
  if (waitingTime > 0) {
    yield delay(waitingTime);
  }
}

/**
 * Load all the BPD details data:
 * - Activation Status
 * - Abi list
 * - Periods
 * - Amount foreach period !== "Inactive"
 * - Transactions foreach period !== "Inactive"
 */
export function* loadBpdData() {
  yield call(checkPreviousFailures);
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
