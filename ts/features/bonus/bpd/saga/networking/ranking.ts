import { Either, left, right } from "fp-ts/lib/Either";
import { call, Effect } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BpdRankingReady } from "../../store/reducers/details/periods";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import { AwardPeriodId } from "../../store/actions/periods";
import { getError } from "../../../../../utils/errors";

// Load the ranking for all the periods
export function* bpdLoadRaking(
  getRanking: ReturnType<typeof BackendBpdClient>["getRanking"]
): Generator<Effect, Either<Error, ReadonlyArray<BpdRankingReady>>, any> {
  try {
    const getRankingResult: SagaCallReturnType<typeof getRanking> = yield call(
      getRanking,
      {} as any
    );
    if (getRankingResult.isRight()) {
      if (getRankingResult.value.status === 200) {
        return right<Error, ReadonlyArray<BpdRankingReady>>(
          getRankingResult.value.value.map<BpdRankingReady>(rr => ({
            ...rr,
            awardPeriodId: rr.awardPeriodId as AwardPeriodId,
            kind: "ready"
          }))
        );
      } else {
        return left<Error, ReadonlyArray<BpdRankingReady>>(
          new Error(`response status ${getRankingResult.value.status}`)
        );
      }
    } else {
      return left<Error, ReadonlyArray<BpdRankingReady>>(
        new Error(readableReport(getRankingResult.value))
      );
    }
  } catch (e) {
    return left<Error, ReadonlyArray<BpdRankingReady>>(getError(e));
  }
}
