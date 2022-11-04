import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { CitizenRankingMilestoneResourceArray } from "../../../../../../definitions/bpd/citizen_v2/CitizenRankingMilestoneResourceArray";
import { MilestoneResource } from "../../../../../../definitions/bpd/citizen_v2/MilestoneResource";
import { mixpanelTrack } from "../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { AwardPeriodId } from "../../store/actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadMilestone
} from "../../store/actions/transactions";
import { BpdRankingReady } from "../../store/reducers/details/periods";
import { BpdPivotTransaction } from "../../store/reducers/details/transactionsv2/entities";

const version = "_V2";

const mixpanelActionRequest = `BPD_RANKING${version}_REQUEST`;
const mixpanelActionSuccess = `BPD_RANKING${version}_SUCCESS`;
const mixpanelActionFailure = `BPD_RANKING${version}_FAILURE`;

// convert the network payload ranking into the relative app domain model
const convertRankingArrayV2 = (
  rankings: CitizenRankingMilestoneResourceArray
): ReadonlyArray<BpdRankingReady> =>
  rankings.map<BpdRankingReady>(rr => ({
    ...rr,
    awardPeriodId: rr.awardPeriodId as AwardPeriodId,
    pivot: extractPivot(rr.milestoneResource),
    kind: "ready"
  }));

const extractPivot = (
  mr: MilestoneResource | undefined
): BpdPivotTransaction | undefined => {
  if (mr?.idTrxPivot !== undefined && mr?.cashbackNorm !== undefined) {
    return {
      amount: mr.cashbackNorm,
      idTrx: mr.idTrxPivot as BpdTransactionId
    };
  }
  return undefined;
};

/**
 * Load the ranking for all the periods
 * @param getRanking
 */
export function* bpdLoadRakingV2(
  getRanking: ReturnType<typeof BackendBpdClient>["getRankingV2"]
): Generator<
  ReduxSagaEffect,
  E.Either<Error, ReadonlyArray<BpdRankingReady>>,
  any
> {
  try {
    void mixpanelTrack(mixpanelActionRequest);
    const getRankingResult: SagaCallReturnType<typeof getRanking> = yield* call(
      getRanking,
      {} as any
    );
    if (E.isRight(getRankingResult)) {
      if (getRankingResult.right.status === 200) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: getRankingResult.right.value?.length
        });
        return E.right<Error, ReadonlyArray<BpdRankingReady>>(
          convertRankingArrayV2(getRankingResult.right.value)
        );
      } else if (getRankingResult.right.status === 404) {
        void mixpanelTrack(mixpanelActionSuccess, {
          count: 0
        });
        return E.right<Error, ReadonlyArray<BpdRankingReady>>([]);
      } else {
        return E.left<Error, ReadonlyArray<BpdRankingReady>>(
          new Error(`response status ${getRankingResult.right.status}`)
        );
      }
    } else {
      return E.left<Error, ReadonlyArray<BpdRankingReady>>(
        new Error(readableReport(getRankingResult.left))
      );
    }
  } catch (e) {
    void mixpanelTrack(mixpanelActionFailure, {
      reason: getError(e).message
    });
    return E.left<Error, ReadonlyArray<BpdRankingReady>>(getError(e));
  }
}

/**
 * Handle the action bpdTransactionsLoadMilestone.request
 * @param getRanking
 * @param action
 */
export function* handleLoadMilestone(
  getRanking: ReturnType<typeof BackendBpdClient>["getRankingV2"],
  action: ActionType<typeof bpdTransactionsLoadMilestone.request>
) {
  // get the results
  const result: SagaCallReturnType<typeof bpdLoadRakingV2> = yield* call(
    bpdLoadRakingV2,
    getRanking
  );

  const extractMilestonePivot = pipe(
    result,
    E.chain(x =>
      E.fromOption(
        () =>
          new Error(
            `Period ${action.payload} not found in the ranking response`
          )
      )(
        pipe(
          x,
          RA.findFirst(el => el.awardPeriodId === action.payload),
          O.map(el => el.pivot)
        )
      )
    )
  );

  // dispatch the related action
  if (E.isRight(extractMilestonePivot)) {
    yield* put(
      bpdTransactionsLoadMilestone.success({
        awardPeriodId: action.payload,
        result: extractMilestonePivot.right
      })
    );
  } else {
    yield* put(
      bpdTransactionsLoadMilestone.failure({
        awardPeriodId: action.payload,
        error: extractMilestonePivot.left
      })
    );
  }
}
