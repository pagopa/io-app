import * as AR from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { all, call, put } from "typed-redux-saga/macro";
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
import { bpdLoadRakingV2 } from "./ranking";

/**
 * Load the periods information list and adds the amount and ranking information
 * foreach period (active or closed)
 * @param bpdClient
 */
export function* loadPeriodsWithInfo(
  bpdClient: Pick<
    ReturnType<typeof BackendBpdClient>,
    "awardPeriods" | "totalCashback" | "getRankingV2"
  >
) {
  // Request the period list
  const maybePeriods: SagaCallReturnType<typeof bpdLoadPeriodsSaga> =
    yield* call(bpdLoadPeriodsSaga, bpdClient.awardPeriods);

  if (E.isLeft(maybePeriods)) {
    // Error while receiving the period list
    yield* put(bpdPeriodsAmountLoad.failure(maybePeriods.left));
  } else {
    const periods = maybePeriods.right;

    const rankings: E.Either<
      Error,
      ReadonlyArray<BpdRankingReady>
    > = yield* call(bpdLoadRakingV2, bpdClient.getRankingV2);

    if (E.isLeft(rankings)) {
      yield* put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading rankings"))
      );
      return;
    }

    // request the amounts for all the required periods
    const amounts: ReadonlyArray<SagaCallReturnType<typeof bpdLoadAmountSaga>> =
      yield* all(
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
    if (amounts.some(E.isLeft)) {
      yield* put(
        bpdPeriodsAmountLoad.failure(new Error("Error while loading amounts"))
      );
      return;
    }

    // the transactionNumber and totalCashback for inactive (future) period is 0, no need to request
    // creating the static response
    const amountWithInactivePeriod = [
      ...periods
        .filter(p => p.status === "Inactive")
        .map<E.Either<BpdAmountError, BpdAmount>>(p =>
          E.right({
            awardPeriodId: p.awardPeriodId,
            transactionNumber: 0,
            totalCashback: 0
          })
        ),
      ...amounts
    ];

    // compose the period with the amount information
    const periodsWithAmount = amountWithInactivePeriod
      .filter(E.isRight)
      .reduce<ReadonlyArray<BpdPeriodWithInfo>>(
        (acc, curr) =>
          pipe(
            [...periods],
            AR.findFirst(p => p.awardPeriodId === curr.right.awardPeriodId),
            O.foldW(
              () => acc,
              period => [
                ...acc,
                {
                  ...period,
                  amount: curr.right,
                  ranking: pipe(
                    [...rankings.right],
                    AR.findFirst<BpdRanking>(
                      r => r.awardPeriodId === curr.right.awardPeriodId
                    ),
                    O.getOrElseW(() =>
                      bpdRankingNotReady(curr.right.awardPeriodId)
                    )
                  )
                }
              ]
            )
          ),
        []
      );
    yield* put(bpdPeriodsAmountLoad.success(periodsWithAmount));
  }
}
