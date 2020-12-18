import { findFirst } from "fp-ts/lib/Array";
import { Either, isRight, right } from "fp-ts/lib/Either";
import { select, take } from "redux-saga-test-plan/matchers";
import { all, call, put } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { loadAbi } from "../../../../wallet/onboarding/bancomat/store/actions";
import { abiSelector } from "../../../../wallet/onboarding/store/abi";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { isReady } from "../../model/RemoteValue";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { bpdPeriodsAmountLoad } from "../../store/actions/periods";
import { bpdTransactionsLoad } from "../../store/actions/transactions";
import {
  BpdPeriodWithInfo,
  BpdRanking,
  bpdRankingNotReady
} from "../../store/reducers/details/periods";
import { BpdAmount, BpdAmountError, bpdLoadAmountSaga } from "./amount";
import { bpdLoadPeriodsSaga } from "./periods";
import { bpdLoadRaking } from "./ranking";

/**
 * Prefetch all the BPD details data:
 * - Activation Status
 * - Abi list
 * - Periods
 * - Amount foreach period !== "Inactive"
 * - Transactions foreach period !== "Inactive"
 */
export function* loadBpdData() {
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

/**
 * Load the periods list with the amount and ranking information foreach period (active or closed)
 * @param bpdClient
 */
export function* loadPeriodsWithInfo(
  bpdClient: Pick<
    ReturnType<typeof BackendBpdClient>,
    "awardPeriods" | "totalCashback"
  >
) {
  // Request the period list
  const maybePeriods: SagaCallReturnType<typeof bpdLoadPeriodsSaga> = yield call(
    bpdLoadPeriodsSaga,
    bpdClient.awardPeriods
  );

  if (maybePeriods.isLeft()) {
    // Error while receiving the period list
    yield put(bpdPeriodsAmountLoad.failure(maybePeriods.value));
  } else {
    const periods = maybePeriods.value;

    const rankings: SagaCallReturnType<typeof bpdLoadRaking> = yield call(
      bpdLoadRaking
    );

    if (rankings.isLeft()) {
      yield put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading rankings"))
      );
      return;
    }

    // request the amounts for all the required periods
    const amounts: ReadonlyArray<SagaCallReturnType<
      typeof bpdLoadAmountSaga
    >> = yield all(
      periods
        // no need to request the inactive period, the amount and transaction number is always 0
        .filter(p => p.status !== "Inactive")
        .map(period =>
          call(bpdLoadAmountSaga, bpdClient.totalCashback, period.awardPeriodId)
        )
    );

    // Check if the required period amount are without error
    // With a single error, we can't display the periods list
    if (amounts.some(a => a.isLeft())) {
      yield put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      );
      return;
    }

    // the transactionNumber and totalCashback for inactive (future) period is 0, no need to request
    // creating the static response
    const amountWithInactivePeriod = [
      ...periods
        .filter(p => p.status === "Inactive")
        .map<Either<BpdAmountError, BpdAmount>>(p =>
          right({
            awardPeriodId: p.awardPeriodId,
            transactionNumber: 0,
            totalCashback: 0
          })
        ),
      ...amounts
    ];

    // compose the period with the amount information
    const periodsWithAmount = amountWithInactivePeriod
      .filter(isRight)
      .reduce<ReadonlyArray<BpdPeriodWithInfo>>(
        (acc, curr) =>
          findFirst(
            [...periods],
            p => p.awardPeriodId === curr.value.awardPeriodId
          ).fold(acc, period => [
            ...acc,
            {
              ...period,
              amount: curr.value,
              ranking: findFirst<BpdRanking>(
                [...rankings.value],
                r => r.awardPeriodId === curr.value.awardPeriodId
              ).getOrElse(bpdRankingNotReady(curr.value.awardPeriodId))
            }
          ]),
        []
      );
    yield put(bpdPeriodsAmountLoad.success(periodsWithAmount));
  }
}
