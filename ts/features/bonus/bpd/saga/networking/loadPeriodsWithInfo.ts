import { findFirst } from "fp-ts/lib/Array";
import { Either, isRight, right } from "fp-ts/lib/Either";
import { all, call, put } from "redux-saga/effects";
import { bpdTransactionsPaging } from "../../../../../config";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { bpdPeriodsAmountLoad } from "../../store/actions/periods";
import {
  BpdPeriodWithInfo,
  BpdRanking,
  bpdRankingNotReady,
  BpdRankingReady
} from "../../store/reducers/details/periods";
import { BpdAmount, BpdAmountError, bpdLoadAmountSaga } from "./amount";
import { bpdLoadPeriodsSaga } from "./periods";
import { bpdLoadRaking, bpdLoadRakingV2 } from "./ranking";

/**
 * Load the periods information list and adds the amount and ranking information
 * foreach period (active or closed)
 * @param bpdClient
 */
export function* loadPeriodsWithInfo(
  bpdClient: Pick<
    ReturnType<typeof BackendBpdClient>,
    "awardPeriods" | "totalCashback" | "getRanking" | "getRankingV2"
  >
) {
  // Request the period list
  const maybePeriods: SagaCallReturnType<typeof bpdLoadPeriodsSaga> =
    yield call(bpdLoadPeriodsSaga, bpdClient.awardPeriods);

  if (maybePeriods.isLeft()) {
    // Error while receiving the period list
    yield put(bpdPeriodsAmountLoad.failure(maybePeriods.value));
  } else {
    const periods = maybePeriods.value;

    const rankings: Either<Error, ReadonlyArray<BpdRankingReady>> = yield call(
      bpdTransactionsPaging ? bpdLoadRakingV2 : bpdLoadRaking,
      bpdTransactionsPaging ? bpdClient.getRankingV2 : bpdClient.getRanking
    );

    if (rankings.isLeft()) {
      yield put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading rankings"))
      );
      return;
    }

    // request the amounts for all the required periods
    const amounts: ReadonlyArray<SagaCallReturnType<typeof bpdLoadAmountSaga>> =
      yield all(
        periods
          // no need to request the inactive period, the amount and transaction number is always 0
          .filter(p => p.status !== "Inactive")
          .map(period =>
            call(
              bpdLoadAmountSaga,
              bpdClient.totalCashback,
              period.awardPeriodId
            )
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
