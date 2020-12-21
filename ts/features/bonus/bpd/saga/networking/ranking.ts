import { Either, right } from "fp-ts/lib/Either";
import { Effect } from "redux-saga/effects";
import { readyRanking } from "../../store/reducers/__mock__/ranking";
import { BpdRankingReady } from "../../store/reducers/details/periods";

// Load the ranking for all the periods
// TODO: replace with networking logic and remove the eslint-disable
// eslint-disable-next-line require-yield
export function* bpdLoadRaking(): Generator<
  Effect,
  Either<Error, ReadonlyArray<BpdRankingReady>>,
  any
> {
  return right<Error, ReadonlyArray<BpdRankingReady>>([readyRanking]);
}
