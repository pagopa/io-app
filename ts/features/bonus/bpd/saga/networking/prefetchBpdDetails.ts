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
import { BpdPeriodWithAmount } from "../../store/reducers/details/periods";
import { BpdAmount, BpdAmountError, bpdLoadAmountSaga } from "./amount";
import { bpdLoadPeriodsSaga } from "./periods";

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
      periods.payload.map(period =>
        put(bpdTransactionsLoad.request(period.awardPeriodId))
      )
    );
  }

  // const result: ActionType<
  //   typeof bpdPeriodsLoad.success | typeof bpdPeriodsLoad.failure
  // > = yield take([
  //   getType(bpdPeriodsLoad.success),
  //   getType(bpdPeriodsLoad.failure)
  // ]);
  //
  // if (result.type === getType(bpdPeriodsLoad.success)) {
  //   yield all(
  //     result.payload.map(period =>
  //       put(bpdAmountLoad.request(period.awardPeriodId))
  //     )
  //   );
  //   yield all(
  //     result.payload.map(period =>
  //       put(bpdTransactionsLoad.request(period.awardPeriodId))
  //     )
  //   );
  // }
}

export function* loadPeriodsAmount(
  awardPeriods: ReturnType<typeof BackendBpdClient>["awardPeriods"],
  totalCashback: ReturnType<typeof BackendBpdClient>["totalCashback"]
) {
  const maybePeriods: SagaCallReturnType<typeof bpdLoadPeriodsSaga> = yield call(
    bpdLoadPeriodsSaga,
    awardPeriods
  );

  if (maybePeriods.isLeft()) {
    yield put(bpdPeriodsAmountLoad.failure(maybePeriods.value));
  } else {
    const periods = maybePeriods.value;
    const amounts: ReadonlyArray<SagaCallReturnType<
      typeof bpdLoadAmountSaga
    >> = yield all(
      periods
        .filter(p => p.status !== "Inactive")
        .map(period =>
          call(bpdLoadAmountSaga, totalCashback, period.awardPeriodId)
        )
    );

    if (amounts.some(a => a.isLeft())) {
      yield put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      );
    }

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

    const periodsWithAmount = amountWithInactivePeriod.filter(isRight).reduce(
      (acc, curr) =>
        findFirst(
          [...periods],
          p => p.awardPeriodId === curr.value.awardPeriodId
        ).fold(acc, period => [
          ...acc,
          {
            ...period,
            amount: curr.value
          }
        ]),
      [] as ReadonlyArray<BpdPeriodWithAmount>
    );
    console.log(periodsWithAmount);
    yield put(bpdPeriodsAmountLoad.success(periodsWithAmount));
  }
}
